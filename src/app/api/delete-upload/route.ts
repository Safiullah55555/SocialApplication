import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

// Initialize UTApi with your configuration
const utapi = new UTApi({
  // Your UploadThing token from dashboard
  token: process.env.UPLOADTHING_TOKEN,
});

export async function POST(req: Request) {
  try {
    const { key } = await req.json();
    
    if (!key) {
      return NextResponse.json(
        { error: "Missing file key" }, 
        { status: 400 }
      );
    }

    // Delete the file from UploadThing
    const result = await utapi.deleteFiles(key);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to delete file from UploadThing" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "File deleted successfully", success: true }
    );

  } catch (error) {
    console.error("Delete upload error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}