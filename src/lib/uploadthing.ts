import  type { OurFileRouter } from "@/app/api/uploadthing/core";
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

// import type { OurFileRouter } from "~/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// export async function deleteUpload(key: string) {
//   if (!key) return; // Prevent accidental empty deletes
//   await fetch("https://uploadthing.com/api/deleteFile", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${process.env.UPLOADTHING_SECRET}` // Make sure this env var is set!
//     },
//     body: JSON.stringify({ key }),
//   });
// }
