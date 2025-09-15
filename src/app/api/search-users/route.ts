// app/api/search-user/route.ts
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { 
            username: { 
              contains: query, 
              mode: "insensitive" 
            } 
          },
          { 
            name: { 
              contains: query, 
              mode: "insensitive" 
            } 
          },
        ]
      },
      take: 5,
      select: {
        id: true,
        name: true,
        username: true,
        image: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}