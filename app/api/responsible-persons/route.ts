
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const totalCount = await prisma.responsiblePerson.count();
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const items = await prisma.responsiblePerson.findMany({
      orderBy: { name: "asc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching responsible persons:", error);
    return NextResponse.json(
      { error: "Failed to fetch responsible persons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, code } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const item = await prisma.responsiblePerson.create({
      data: {
        name,
        code: code || null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating responsible persons:", error);
    return NextResponse.json(
      { error: "Failed to create responsible persons" },
      { status: 500 }
    );
  }
}
