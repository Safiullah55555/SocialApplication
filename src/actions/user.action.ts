"use server"

import { prisma } from "@/lib/prisma"
// import { deleteUpload } from "@/lib/uploadthing"
import { auth, currentUser } from "@clerk/nextjs/server"
// import { stat } from "fs"
import { revalidatePath } from "next/cache"

export async function syncUser() {
        try {
                const { userId } = await auth()
                const user = await currentUser()

                if (!userId || !user) return

                // Check if the user already exists in the database
                const existingUser = await prisma.user.findUnique({
                        where: {
                                clerkId: userId
                        }
                })

                if (existingUser) return existingUser


                //else.
                const dbUser = await prisma.user.create({
                        data: {
                                clerkId: userId,
                                name: `${user.firstName || ""} ${user.lastName || ""}`,
                                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                                email: user.emailAddresses[0].emailAddress,
                                image: user.imageUrl,

                        }
                })

                return dbUser

        } catch (error) {
                console.error("Error syncing user:", error)
        }
}

export async function getUserByClerkId(clerkId: string) {
        return prisma.user.findUnique({
                where: {
                        clerkId: clerkId
                },
                include: {
                        _count: {
                                select: {
                                        followers: true,
                                        following: true,
                                        posts: true,
                                }
                        }
                }
        })
}


export async function getDbUserId() {
        const { userId: clerkId } = await auth()

        if (!clerkId) return null //

        const user = await getUserByClerkId(clerkId)
        if (!user) throw new Error("User not found")
        return user.id
}

export async function getRandomUsers() {
        try {
                const userId = await getDbUserId()

                if(!userId) return [] //

                //get random users excluding the current user(ourself) and our following users.
                const randomUsers = await prisma.user.findMany({
                        where: {
                                AND: [
                                        { NOT: { id: userId } }, //ourself 
                                        { NOT: { followers: { some: { followerId: userId } } } } //users we follow will not be shown.
                                ]
                        },
                        select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true,
                                _count: {
                                        select: { followers: true }

                                }
                        },
                        take: 3,
                })
                return randomUsers;
        } catch (error) {
                console.error("Error fetching random users:", error)
                // Optionally, you can throw an error or return null/undefined
                return []
        }
}

export async function toggleFollow(targetUserId: string) {
        try {
                const userId = await getDbUserId()

                if(!userId) return [] //

                if (userId === targetUserId) throw new Error("You cannot follow yourself")
                        
                const existingFollow = await prisma.follows.findUnique({
                        where:{
                                followerId_followingId: {
                                        followerId : userId,
                                        followingId: targetUserId
                                }
                        }
                })
                if (existingFollow){
                        // Unfollow the user
                        await prisma.follows.delete({
                                where: {
                                        followerId_followingId: {
                                                followerId: userId,
                                                followingId: targetUserId
                                        }
                                }
                        })
                }else{
                        // Follow the user.... //transaction ---> do both but if one fails do none of them(fail both). 
                        await prisma.$transaction([
                                prisma.follows.create({ //first
                                        data: {
                                                followerId: userId,
                                                followingId: targetUserId
                                        }
                                }),
                                prisma.notification.create({ //second.
                                        data:{
                                           type:"FOLLOW",
                                           userId: targetUserId,
                                           creatorId: userId,     
                                        }
                                })
                        ])
                }
                revalidatePath("/") //clear the cache for the home page.
                return{success:true}

        } catch (error) {
                console.error("Error toggling follow:", error)
                return { success: false, error: "Failed to toggle follow" }
                
        }
}


export async function getDbUserByClerkId(clerkId: string) {
        return prisma.user.findUnique({
                where: {
                        clerkId: clerkId
                },
                select: {
                        id: true,
                        image: true
                }
        })
}




// export async function deleteProfileImageAndCleanup() {
//   try {
//     const { userId: clerkId } = await auth();
//     if (!clerkId) throw new Error("Unauthorized");

//     // Get current user and their old imageKey
//     const user = await prisma.user.findUnique({
//       where: { clerkId },
//       select: { imageKey: true },
//     });

//     // Delete old image from UploadThing if it exists
//     if (user?.imageKey) {
//       await deleteUpload(user.imageKey);
//     }

//     // Update user with image and key cleared
//     await prisma.user.update({
//       where: { clerkId },
//       data: {
//         image: null,
//         imageKey: null,
//       },
//     });

//     return { success: true };
//   } catch (error) {
//     console.error("Error deleting profile image:", error);
//     return { success: false, error: "Failed to delete profile image" };
//   }
// }