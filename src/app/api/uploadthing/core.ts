//uploadthing/core.ts

import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  // define routes for different upload types
  postImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // this code runs on your server before upload
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");

      // whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        return { 
                url: file.url,
                key: file.key 
        };
      } catch (error) {
        console.error("Error in onUploadComplete:", error);
        throw error;
      }
    }),
    //endpoint/route for profile images.
    profileImage: f({
      image:{
        maxFileSize: "4MB",
        maxFileCount: 1,
      },
    })
    .middleware(async ()=>{
      const {userId} = await auth()
      if(!userId) throw new Error("Unauthorized")
      return {userId}
    })
    .onUploadComplete(async({metadata, file})=>{
      try{
        return{
          url: file.url,
          key: file.key
        };
      }catch(error){
        console.error("Error in onUploadComplete edit profile:", error);
        throw error;
      }
    })
    
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;