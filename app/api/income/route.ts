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
    const centerId = searchParams.get("centerId");
    const programId = searchParams.get("programId");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {};
    if (centerId) where.centerId = centerId;
    if (programId) where.programId = programId;
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);

    // Get total count for pagination
    const totalCount = await prisma.incomeRecord.count({ where });

    // Calculate pagination values
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const incomeRecords = await prisma.incomeRecord.findMany({
      where,
      include: {
        center: true,
        program: true,
        partner: true,
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: incomeRecords,
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
    console.error("Error fetching income records:", error);
    return NextResponse.json(
      { error: "Failed to fetch income records" },
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
      programId,
      partnerId,
      numberOfClasses,
      numberOfStudents,
      revenue,
      status,
      notes,
      uploadedFileUrl,
      tuitionFeeFullYear,
      tuitionFeeHalfYear,
      tuitionFeeDiscount,
      tuitionFeeOld,
      sessionCount,
      sessionCountNew,
      numClassesHalfFee,
      numClassesFullFee,
      numStudentsHalfFee,
      numStudentsFullFee,
      numDiscountedStudents,
      discount,
      payType,
      oldStudent,
      freeStudentCount,
      totalTuitionFee,
      facilitiesFee,
      adminDeduction,
      agentCommission,
      teacherDeduction,
      totalDeduction,
      actualReceivable,
      submittedToCenter,
      collectionDate,
      difference,
      selfEnrollCount,
      retentionRate,
      staffInvolved,
      hrRetention,
      hrContract,
      schoolDeductionMethod,
      centerDeductionMethod,
      contractStatus,
      teacherRate,
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

    // Revenue is now optional, but if provided must be valid
    if (revenue && revenue !== "undefined" && !isNaN(parseFloat(revenue))) {
      // Valid revenue provided - continue
    } else if (
      revenue &&
      (revenue === "undefined" || isNaN(parseFloat(revenue)))
    ) {
      return NextResponse.json(
        { error: "Revenue must be a valid number if provided" },
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

    if (programId) {
      const program = await prisma.program.findUnique({
        where: { id: programId },
      });
      if (!program) {
        return NextResponse.json(
          { error: "Program not found" },
          { status: 400 }
        );
      }
    }

    if (partnerId) {
      const partner = await prisma.partner.findUnique({
        where: { id: partnerId },
      });
      if (!partner) {
        return NextResponse.json(
          { error: "Partner not found" },
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

    // Helper function to convert string to int or null
    const toInt = (value: any): any => {
      if (value === "" || value === null || value === undefined) return null;
      const num = parseInt(value);
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

    // Build data object with proper null handling
    const incomeRecord = await prisma.incomeRecord.create({
      data: {
        month: parseInt(month),
        year: parseInt(year),
        centerId,
        programId: programId || null,
        partnerId: partnerId || null,
        numberOfClasses: toInt(numberOfClasses) || 0,
        numberOfStudents: toInt(numberOfStudents) || 0,
        revenue: toDecimal(revenue),
        status: status || null,
        notes: notes || null,
        uploadedFileUrl: uploadedFileUrl || null,
        tuitionFeeFullYear: toDecimal(tuitionFeeFullYear),
        tuitionFeeHalfYear: toDecimal(tuitionFeeHalfYear),
        tuitionFeeDiscount: toDecimal(tuitionFeeDiscount),
        tuitionFeeOld: toDecimal(tuitionFeeOld),
        sessionCount: toInt(sessionCount),
        sessionCountNew: toInt(sessionCountNew),
        numClassesHalfFee: toInt(numClassesHalfFee),
        numClassesFullFee: toInt(numClassesFullFee),
        numStudentsHalfFee: toInt(numStudentsHalfFee),
        numStudentsFullFee: toInt(numStudentsFullFee),
        numDiscountedStudents: toInt(numDiscountedStudents),
        discount: toDecimal(discount),
        payType: payType || null,
        oldStudent: oldStudent || null,
        freeStudentCount: toInt(freeStudentCount),
        totalTuitionFee: toDecimal(totalTuitionFee),
        facilitiesFee: toDecimal(facilitiesFee),
        adminDeduction: toDecimal(adminDeduction),
        agentCommission: toDecimal(agentCommission),
        teacherDeduction: toDecimal(teacherDeduction),
        totalDeduction: toDecimal(totalDeduction),
        actualReceivable: toDecimal(actualReceivable),
        submittedToCenter: toDecimal(submittedToCenter),
        collectionDate: collectionDate ? new Date(collectionDate) : null,
        difference: toDecimal(difference),
        selfEnrollCount: toInt(selfEnrollCount),
        retentionRate: retentionRate || null,
        staffInvolved: staffInvolved || null,
        hrRetention: hrRetention || null,
        hrContract: hrContract || null,
        schoolDeductionMethod: schoolDeductionMethod || null,
        centerDeductionMethod: centerDeductionMethod || null,
        contractStatus: contractStatus || null,
        teacherRate: teacherRate || null,
      },
    });

    return NextResponse.json(incomeRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating income record:", error);
    return NextResponse.json(
      { error: "Failed to create income record" },
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
      programId,
      partnerId,
      numberOfClasses,
      numberOfStudents,
      revenue,
      status,
      notes,
      uploadedFileUrl,
      tuitionFeeFullYear,
      tuitionFeeHalfYear,
      tuitionFeeDiscount,
      tuitionFeeOld,
      sessionCount,
      sessionCountNew,
      numClassesHalfFee,
      numClassesFullFee,
      numStudentsHalfFee,
      numStudentsFullFee,
      numDiscountedStudents,
      discount,
      payType,
      oldStudent,
      freeStudentCount,
      totalTuitionFee,
      facilitiesFee,
      adminDeduction,
      agentCommission,
      teacherDeduction,
      totalDeduction,
      actualReceivable,
      submittedToCenter,
      collectionDate,
      difference,
      selfEnrollCount,
      retentionRate,
      staffInvolved,
      hrRetention,
      hrContract,
      schoolDeductionMethod,
      centerDeductionMethod,
      contractStatus,
      teacherRate,
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

    if (programId) {
      const program = await prisma.program.findUnique({
        where: { id: programId },
      });
      if (!program) {
        return NextResponse.json(
          { error: "Program not found" },
          { status: 400 }
        );
      }
    }

    if (partnerId) {
      const partner = await prisma.partner.findUnique({
        where: { id: partnerId },
      });
      if (!partner) {
        return NextResponse.json(
          { error: "Partner not found" },
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

    // Helper function to convert string to int or null
    const toInt = (value: any): any => {
      if (value === "" || value === null || value === undefined) return null;
      const num = parseInt(value);
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

    const incomeRecord = await prisma.incomeRecord.update({
      where: { id },
      data: {
        month: month !== undefined ? parseInt(month) : undefined,
        year: year !== undefined ? parseInt(year) : undefined,
        centerId,
        programId,
        partnerId: partnerId || null,
        numberOfClasses: toInt(numberOfClasses),
        numberOfStudents: toInt(numberOfStudents),
        revenue: toDecimal(revenue) ?? 0,
        status: status || null,
        notes: notes || null,
        uploadedFileUrl: uploadedFileUrl || null,
        tuitionFeeFullYear: toDecimal(tuitionFeeFullYear),
        tuitionFeeHalfYear: toDecimal(tuitionFeeHalfYear),
        tuitionFeeDiscount: toDecimal(tuitionFeeDiscount),
        tuitionFeeOld: toDecimal(tuitionFeeOld),
        sessionCount: toInt(sessionCount),
        sessionCountNew: toInt(sessionCountNew),
        numClassesHalfFee: toInt(numClassesHalfFee),
        numClassesFullFee: toInt(numClassesFullFee),
        numStudentsHalfFee: toInt(numStudentsHalfFee),
        numStudentsFullFee: toInt(numStudentsFullFee),
        numDiscountedStudents: toInt(numDiscountedStudents),
        discount: toDecimal(discount),
        payType: payType || null,
        oldStudent: oldStudent || null,
        freeStudentCount: toInt(freeStudentCount),
        totalTuitionFee: toDecimal(totalTuitionFee),
        facilitiesFee: toDecimal(facilitiesFee),
        adminDeduction: toDecimal(adminDeduction),
        agentCommission: toDecimal(agentCommission),
        teacherDeduction: toDecimal(teacherDeduction),
        totalDeduction: toDecimal(totalDeduction),
        actualReceivable: toDecimal(actualReceivable),
        submittedToCenter: toDecimal(submittedToCenter),
        collectionDate: collectionDate ? new Date(collectionDate) : null,
        difference: toDecimal(difference),
        selfEnrollCount: toInt(selfEnrollCount),
        retentionRate: retentionRate || null,
        staffInvolved: staffInvolved || null,
        hrRetention: hrRetention || null,
        hrContract: hrContract || null,
        schoolDeductionMethod: schoolDeductionMethod || null,
        centerDeductionMethod: centerDeductionMethod || null,
        contractStatus: contractStatus || null,
        teacherRate: teacherRate || null,
      },
    });

    return NextResponse.json(incomeRecord);
  } catch (error) {
    console.error("Error updating income record:", error);
    return NextResponse.json(
      { error: "Failed to update income record" },
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

    await prisma.incomeRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting income record:", error);
    return NextResponse.json(
      { error: "Failed to delete income record" },
      { status: 500 }
    );
  }
}
