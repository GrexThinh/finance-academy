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

    // Check if another partner with the same name exists
    const existingPartner = await prisma.partner.findFirst({
      where: {
        name,
        id: { not: params.id }
      },
    });

    if (existingPartner) {
      return NextResponse.json(
        { error: "Partner with this name already exists" },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: { name, code },
    });

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Error updating partner:", error);
    return NextResponse.json(
      { error: "Failed to update partner" },
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

    // Check if partner has related records
    const incomeCount = await prisma.incomeRecord.count({
      where: { partnerId: params.id },
    });

    if (incomeCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete partner with existing income records" },
        { status: 400 }
      );
    }

    await prisma.partner.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json(
      { error: "Failed to delete partner" },
      { status: 500 }
    );
  }
}
