import { NextResponse } from "next/server";
import { getPostsPaged } from "@/actions/post.action";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = 20;

  const posts = await getPostsPaged({ page, limit });
  return NextResponse.json(posts);
}