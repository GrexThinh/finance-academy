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
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (status) where.status = status;

    // Add search functionality
    if (search) {
      where.OR = [
        { center: { name: { contains: search, mode: "insensitive" } } },
        { category: { contains: search, mode: "insensitive" } },
        { item: { name: { contains: search, mode: "insensitive" } } },
        { responsible: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.expenseRecord.count({ where });

    // Calculate pagination values
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const expenseRecords = await prisma.expenseRecord.findMany({
      where,
      include: {
        center: true,
        item: true,
        responsible: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: expenseRecords,
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
    console.error("Error fetching expense records:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense records" },
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
    const {
      month,
      year,
      centerId,
      category,
      itemId,
      position,
      contractType,
      hours,
      unitPrice,
      amount,
      kilometers,
      travelAllowance,
      responsibleId,
      status,
      total,
      notes,
      uploadedFileUrl,
    } = body;

    // Validate required fields
    if (!month || isNaN(parseInt(month))) {
      return NextResponse.json(
        { error: "Valid month is required" },
        { status: 400 }
      );
    }

    if (!year || isNaN(parseInt(year))) {
      return NextResponse.json(
        { error: "Valid year is required" },
        { status: 400 }
      );
    }

    if (!centerId) {
      return NextResponse.json(
        { error: "Center ID is required" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    if (!itemId) {
      return NextResponse.json({ error: "Item is required" }, { status: 400 });
    }

    if (!amount || amount === "undefined" || isNaN(parseFloat(amount))) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (!total || total === "undefined" || isNaN(parseFloat(total))) {
      return NextResponse.json(
        { error: "Valid total is required" },
        { status: 400 }
      );
    }

    // Validate required foreign keys exist
    const center = await prisma.center.findUnique({
      where: { id: centerId },
    });
    if (!center) {
      return NextResponse.json({ error: "Center not found" }, { status: 400 });
    }

    // Helper function to convert string to decimal or null
    const toDecimal = (value: any): any => {
      if (value === "" || value === null || value === undefined) return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    };

    // Helper function for required decimal fields
    const toDecimalRequired = (value: any): number => {
      if (
        value === "" ||
        value === null ||
        value === undefined ||
        value === "undefined"
      )
        return 0;
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };

    const expenseRecord = await prisma.expenseRecord.create({
      data: {
        month: parseInt(month),
        year: parseInt(year),
        centerId,
        category: category || null,
        itemId,
        position: position || null,
        contractType: contractType || null,
        hours: toDecimal(hours),
        unitPrice: toDecimal(unitPrice),
        amount: toDecimalRequired(amount),
        kilometers: toDecimal(kilometers),
        travelAllowance: toDecimal(travelAllowance),
        responsibleId: responsibleId || null,
        status: status || null,
        total: toDecimalRequired(total),
        notes: notes || null,
        uploadedFileUrl: uploadedFileUrl || null,
      },
    });

    return NextResponse.json(expenseRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating expense record:", error);
    return NextResponse.json(
      { error: "Failed to create expense record" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      month,
      year,
      centerId,
      category,
      itemId,
      position,
      contractType,
      hours,
      unitPrice,
      amount,
      kilometers,
      travelAllowance,
      responsibleId,
      statusId,
      total,
      notes,
      uploadedFileUrl,
    } = body;

    // Validate required foreign keys exist
    if (centerId) {
      const center = await prisma.center.findUnique({
        where: { id: centerId },
      });
      if (!center) {
        return NextResponse.json(
          { error: "Center not found" },
          { status: 400 }
        );
      }
    }

    if (itemId) {
      const item = await prisma.expenseItem.findUnique({
        where: { id: itemId },
      });
      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 400 });
      }
    }

    if (responsibleId) {
      const responsible = await prisma.responsiblePerson.findUnique({
        where: { id: responsibleId },
      });
      if (!responsible) {
        return NextResponse.json(
          { error: "Responsible person not found" },
          { status: 400 }
        );
      }
    }

    // Helper function to convert string to decimal or null
    const toDecimal = (value: any): any => {
      if (value === "" || value === null || value === undefined) return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    };

    // Helper function for required decimal fields
    const toDecimalRequired = (value: any): number => {
      if (
        value === "" ||
        value === null ||
        value === undefined ||
        value === "undefined"
      )
        return 0;
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };

    const expenseRecord = await prisma.expenseRecord.update({
      where: { id },
      data: {
        month: month !== undefined ? parseInt(month) : undefined,
        year: year !== undefined ? parseInt(year) : undefined,
        centerId,
        category: category !== undefined ? category : undefined,
        itemId: itemId !== undefined ? itemId : undefined,
        position: position || null,
        contractType: contractType || null,
        hours: toDecimal(hours),
        unitPrice: toDecimal(unitPrice),
        amount: toDecimalRequired(amount),
        kilometers: toDecimal(kilometers),
        travelAllowance: toDecimal(travelAllowance),
        responsibleId:
          responsibleId !== undefined ? responsibleId || null : undefined,
        status: status !== undefined ? status : undefined,
        total: toDecimalRequired(total),
        notes: notes || null,
        uploadedFileUrl: uploadedFileUrl || null,
      },
    });

    return NextResponse.json(expenseRecord);
  } catch (error) {
    console.error("Error updating expense record:", error);
    return NextResponse.json(
      { error: "Failed to update expense record" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.expenseRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense record:", error);
    return NextResponse.json(
      { error: "Failed to delete expense record" },
      { status: 500 }
    );
  }
}
