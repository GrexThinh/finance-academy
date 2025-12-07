import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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

    const center = await prisma.center.update({
      where: { id: params.id },
      data: { name, code },
    });

    return NextResponse.json(center);
  } catch (error) {
    console.error("Error updating center:", error);
    return NextResponse.json(
      { error: "Failed to update center" },
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

    // Check if center has related records
    const incomeCount = await prisma.incomeRecord.count({
      where: { centerId: params.id },
    });

    const expenseCount = await prisma.expenseRecord.count({
      where: { centerId: params.id },
    });

    if (incomeCount > 0 || expenseCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete center with existing records" },
        { status: 400 }
      );
    }

    await prisma.center.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting center:", error);
    return NextResponse.json(
      { error: "Failed to delete center" },
      { status: 500 }
    );
  }
}
