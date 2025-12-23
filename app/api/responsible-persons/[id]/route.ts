
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await prisma.responsiblePerson.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "responsible persons not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching responsible persons:", error);
    return NextResponse.json(
      { error: "Failed to fetch responsible persons" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, code } = body;

    const item = await prisma.responsiblePerson.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        code: code !== undefined ? code : undefined,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating responsible persons:", error);
    return NextResponse.json(
      { error: "Failed to update responsible persons" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.responsiblePerson.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting responsible persons:", error);
    return NextResponse.json(
      { error: "Failed to delete responsible persons" },
      { status: 500 }
    );
  }
}
