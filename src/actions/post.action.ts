"use server"

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

// export async function createPost(content: string, image: string) {
//         try {
//                 const userId = await getDbUserId();

//                 if (!userId) return

//                 const post = await prisma.post.create({
//                         data: {
//                                 content,
//                                 image,
//                                 authorId: userId,
//                         }
//                 })

//                 revalidatePath("/"); //purge the cache for the home page.
//                 return { success: true, post };
//         } catch (error) {
//                 console.error("Error creating post:", error);
//                 return { success: false, error: "Failed to create post in post.action.ts" };
//         }
// }

export async function createPost(content: string, image?: string) {
        try {
                const userId = await getDbUserId();
                if (!userId) return { success: false, error: "Unauthorized" };

                const newPost = await prisma.post.create({
                        data: {
                                content,
                                image: image || null,
                                authorId: userId,
                        },
                        include: {
                                author: {
                                        select: {
                                                id: true,
                                                name: true,
                                                username: true,
                                                image: true,
                                        },
                                },
                                likes: {
                                        select: { userId: true },
                                },
                                _count: {
                                        select: {
                                                likes: true,
                                                comments: true,
                                        },
                                },
                        },
                });

                revalidatePath("/");

                return {
                        success: true,
                        post: {
                                id: newPost.id,
                                content: newPost.content,
                                createdAt: newPost.createdAt.toISOString(),
                                image: newPost.image,
                                author: {
                                        id: newPost.author.id,
                                        name: newPost.author.name,
                                        username: newPost.author.username,
                                        image: newPost.author.image,
                                },
                                likes: newPost.likes,
                                comments: [],
                                _count: {
                                        likes: newPost._count.likes,
                                        comments: newPost._count.comments,
                                },
                        },
                };
        } catch (error) {
                console.error("Error creating post:", error);
                return { success: false, error: "Failed to create post" };
        }
}

export async function getPosts() {
        try {
                const posts = await prisma.post.findMany({
                        take: 20,
                        orderBy: {
                                createdAt: "desc"
                        },
                        include: {
                                author: {
                                        select: {
                                                id: true,
                                                name: true,
                                                image: true,
                                                username: true
                                        }
                                },
                                comments: {
                                        include: {
                                                author: {
                                                        select: {
                                                                id: true,
                                                                username: true,
                                                                image: true,
                                                                name: true
                                                        }
                                                }
                                        },
                                        orderBy: {
                                                createdAt: "asc"
                                        }
                                },
                                likes: {
                                        select: {
                                                userId: true
                                        }
                                },
                                _count: {
                                        select: {
                                                likes: true,
                                                comments: true
                                        }
                                }
                        }
                })

                // return posts;
                // Transform to match Post type (createdAt as string, comments createdAt as string)
                return posts.map(post => ({
                        ...post,
                        createdAt: post.createdAt.toISOString(),
                        comments: post.comments.map(comment => ({
                                ...comment,
                                createdAt: comment.createdAt.toISOString()
                        }))
                }));


        } catch (error) {
                console.log("Error in getPosts.action", error)
                throw new Error("failed in fetch posts");

        }
}

export async function toggleLike(postId: string) {
        try {
                const userId = await getDbUserId();
                if (!userId) return;

                // check if like exists
                const existingLike = await prisma.like.findUnique({
                        where: {
                                userId_postId: {
                                        userId,
                                        postId,
                                },
                        },
                });

                const post = await prisma.post.findUnique({
                        where: { id: postId },
                        select: { authorId: true },
                });

                if (!post) throw new Error("Post not found");

                if (existingLike) {
                        // unlike
                        await prisma.like.delete({
                                where: {
                                        userId_postId: {
                                                userId,
                                                postId,
                                        },
                                },
                        });
                } else {
                        // like and create notification (only if liking someone else's post)
                        await prisma.$transaction([
                                prisma.like.create({
                                        data: {
                                                userId,
                                                postId,
                                        },
                                }),
                                ...(post.authorId !== userId
                                        ? [
                                                prisma.notification.create({
                                                        data: {
                                                                type: "LIKE",
                                                                userId: post.authorId, // recipient (post author)
                                                                creatorId: userId, // person who liked
                                                                postId,
                                                        },
                                                }),
                                        ]
                                        : []),
                        ]);
                }

                revalidatePath("/");
                return { success: true };
        } catch (error) {
                console.error("Failed to toggle like:", error);
                return { success: false, error: "Failed to toggle like" };
        }
}

// export async function createComment(postId: string, content: string) {
//         try {
//                 const userId = await getDbUserId();

//                 if (!userId) return;
//                 if (!content) throw new Error("Content is required");

//                 const post = await prisma.post.findUnique({
//                         where: { id: postId },
//                         select: { authorId: true },
//                 });

//                 if (!post) throw new Error("Post not found");

//                 // Create comment and notification in a transaction
//                 const [comment] = await prisma.$transaction(async (tx) => {
//                         // Create comment first
//                         const newComment = await tx.comment.create({
//                                 data: {
//                                         content,
//                                         authorId: userId,
//                                         postId,
//                                 },
//                         });

//                         // Create notification if commenting on someone else's post
//                         if (post.authorId !== userId) {
//                                 await tx.notification.create({
//                                         data: {
//                                                 type: "COMMENT",
//                                                 userId: post.authorId,
//                                                 creatorId: userId,
//                                                 postId,
//                                                 commentId: newComment.id,
//                                         },
//                                 });
//                         }

//                         return [newComment];
//                 });

//                 revalidatePath(`/`);
//                 return { success: true, comment };
//         } catch (error) {
//                 console.error("Failed to create comment:", error);
//                 return { success: false, error: "Failed to create comment" };
//         }
// }

export async function createComment(postId: string, content: string) {
        try {
                const userId = await getDbUserId();
                if (!userId) return { success: false, error: "Unauthorized" };

                const newComment = await prisma.comment.create({
                        data: {
                                content,
                                postId,
                                authorId: userId,
                        },
                        include: {
                                author: {
                                        select: {
                                                id: true,
                                                name: true,
                                                username: true,
                                                image: true,
                                        },
                                },
                        },
                });

                revalidatePath("/");

                return {
                        success: true,
                        comment: {
                                id: newComment.id,
                                content: newComment.content,
                                createdAt: newComment.createdAt.toISOString(),
                                author: {
                                        id: newComment.author.id,
                                        name: newComment.author.name,
                                        username: newComment.author.username,
                                        image: newComment.author.image,
                                },
                        },
                };
        } catch (error) {
                console.error("Error creating comment:", error);
                return { success: false, error: "Failed to create comment" };
        }
}

export async function deletePost(postId: string) {
        try {
                const userId = await getDbUserId();

                const post = await prisma.post.findUnique({
                        where: { id: postId },
                        select: { authorId: true },
                });

                if (!post) throw new Error("Post not found");
                if (post.authorId !== userId) throw new Error("Unauthorized - no delete permission");

                await prisma.post.delete({
                        where: { id: postId },
                });

                revalidatePath("/"); // purge the cache
                return { success: true };
        } catch (error) {
                console.error("Failed to delete post:", error);
                return { success: false, error: "Failed to delete post" };
        }
}

export async function editPost(postId: string, content: string,) {
        try {
                const userId = await getDbUserId();
                if (!userId) return { success: false, error: "Unauthorized" };

                const post = await prisma.post.findUnique({
                        where: { id: postId },
                        select: { authorId: true },
                });

                if (!post) return { success: false, error: "Post not found" };
                if (post.authorId !== userId) return { success: false, error: "Unauthorized - no edit permission" };



                const updatedPost = await prisma.post.update({
                        where: { id: postId },
                        data: { content },
                });

                revalidatePath("/"); // Purge cache
                return { success: true, post: updatedPost };
        } catch (error) {
                console.error("Error editing post:", error);
                return { success: false, error: "Failed to edit post" };
        }
}


export async function editComment(commentId: string, content: string) {
        try {
                const userId = await getDbUserId();
                if (!userId) return { success: false, error: "Unauthorized" };

                const comment = await prisma.comment.findUnique({
                        where: { id: commentId },
                        select: { authorId: true },
                });

                if (!comment) return { success: false, error: "Comment not found" };
                if (comment.authorId !== userId) return { success: false, error: "Unauthorized - no edit permission" };

                const updatedComment = await prisma.comment.update({
                        where: { id: commentId },
                        data: { content },
                });

                revalidatePath("/"); // Purge cache
                return { success: true, comment: updatedComment };
        } catch (error) {
                console.error("Error editing comment:", error);
                return { success: false, error: "Failed to edit comment" };
        }
}


export async function deleteComment(commentId: string) {
        try {
                const userId = await getDbUserId();
                if (!userId) return { success: false, error: "Unauthorized" };

                const comment = await prisma.comment.findUnique({
                        where: { id: commentId },
                        select: { authorId: true },
                });

                if (!comment) return { success: false, error: "Comment not found" };
                if (comment.authorId !== userId) return { success: false, error: "Unauthorized - no delete permission" };

                await prisma.comment.delete({
                        where: { id: commentId },
                });

                revalidatePath("/"); // Purge cache
                return { success: true };
        } catch (error) {
                console.error("Error deleting comment:", error);
                return { success: false, error: "Failed to delete comment" };
        }
}

//for get 20 posts with pagination
export async function getPostsPaged({
        page = 1,
        limit = 20,
}: { page?: number; limit?: number } = {}) {
        const skip = (page - 1) * limit;

        return await prisma.post.findMany({
                take: limit,
                skip,
                orderBy: { createdAt: "desc" },
                include: {
                        author: {
                                select: { id: true, name: true, image: true, username: true },
                        },
                        comments: {
                                include: {
                                        author: {
                                                select: { id: true, username: true, image: true, name: true },
                                        },
                                },
                                orderBy: { createdAt: "asc" },
                        },
                        likes: { select: { userId: true } },
                        _count: { select: { likes: true, comments: true } },
                },
        });
}