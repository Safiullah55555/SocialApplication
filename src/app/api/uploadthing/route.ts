import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});


// import { NextResponse } from "next/server";
// import { UTApi } from "uploadthing/server";

// const utapi = new UTApi()

// export async function POST(req: Request) {
//   try {
//     const { key } = await req.json();
//     if (!key) {
//       return NextResponse.json({ error: "No file key provided" }, { status: 400 });
//     }

//     await utapi.deleteFiles(key);

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Delete upload error:", error);
//     return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
//   }
// }

