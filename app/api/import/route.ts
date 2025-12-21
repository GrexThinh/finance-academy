import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadFileToS3 } from "@/lib/s3";
import * as XLSX from "xlsx";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const path =
      (formData.get("path") as string) ||
      "victoria-academy-finance/storage/finance";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only Excel files (.xlsx, .xls) are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB for Excel files)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // Optionally store the uploaded file in S3
    const storeFile = formData.get("storeFile") === "true";
    let fileUrl = null;

    if (storeFile) {
      try {
        fileUrl = await uploadFileToS3(file, path);
      } catch (uploadError) {
        console.error("Error storing import file:", uploadError);
        // Continue with import even if file storage fails
      }
    }

    // Convert file to buffer for processing
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });

    const results = {
      incomeImported: 0,
      expenseImported: 0,
      errors: [] as string[],
      uploadedFileUrl: fileUrl,
    };

    // Process DATA sheet (Income)
    const dataSheet = workbook.Sheets["DATA"];
    if (dataSheet) {
      try {
        const data = XLSX.utils.sheet_to_json(dataSheet, {
          header: 1,
        }) as any[][];

        // Skip header row and process data
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0 || !row[0]) continue;

          try {
            // Extract data from Excel row - map modal fields to schema
            // Modal fields: Month, Year, CenterID, PartnerID, Classes, Students, TotalTuitionFee, AgentCommission, TotalDeduction, ActualReceivable, Status, Notes
            const incomeData = {
              month: parseInt(row[0]) || new Date().getMonth() + 1,
              year: parseInt(row[1]) || new Date().getFullYear(),
              centerId: row[2]?.toString() || "",
              programId: "default-program", // Required by schema
              partnerId: row[3]?.toString() || null,
              numberOfClasses: parseInt(row[4]) || 0,
              numberOfStudents: parseInt(row[5]) || 0,
              revenue: row[9]
                ? parseFloat(row[9].toString().replace(/,/g, ""))
                : 0, // Use actualReceivable as revenue (required field)
              status: row[10]?.toString() || "Đã thu",
              notes: row[11]?.toString() || "",
              uploadedFileUrl: fileUrl,
            };

            await prisma.incomeRecord.create({ data: incomeData });
            results.incomeImported++;
          } catch (rowError) {
            results.errors.push(
              `Error importing income row ${i + 1}: ${rowError}`
            );
          }
        }
      } catch (sheetError) {
        results.errors.push(`Error processing DATA sheet: ${sheetError}`);
      }
    }

    // Process CHI sheet (Expenses)
    const chiSheet = workbook.Sheets["CHI"];
    if (chiSheet) {
      try {
        const data = XLSX.utils.sheet_to_json(chiSheet, {
          header: 1,
        }) as any[][];

        // Skip header row and process data
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0 || !row[0]) continue;

          try {
            // Extract data from Excel row - map modal fields to schema
            // Modal fields: Month, Year, CenterID, Category, Item, Responsible, Status, Total, Notes
            const expenseData = {
              month: parseInt(row[0]) || new Date().getMonth() + 1,
              year: parseInt(row[1]) || new Date().getFullYear(),
              centerId: row[2]?.toString() || "",
              category: row[3]?.toString() || "",
              item: row[4]?.toString() || "",
              responsible: row[5]?.toString() || "",
              status: row[6]?.toString() || "Đã chi",
              amount: row[7]
                ? parseFloat(row[7].toString().replace(/,/g, ""))
                : 0, // Required field
              total: row[8]
                ? parseFloat(row[8].toString().replace(/,/g, ""))
                : 0, // Required field
              notes: row[9]?.toString() || "",
              uploadedFileUrl: fileUrl,
            };

            await prisma.expenseRecord.create({ data: expenseData });
            results.expenseImported++;
          } catch (rowError) {
            results.errors.push(
              `Error importing expense row ${i + 1}: ${rowError}`
            );
          }
        }
      } catch (sheetError) {
        results.errors.push(`Error processing CHI sheet: ${sheetError}`);
      }
    }

    return NextResponse.json({
      message: `Import completed. Income: ${results.incomeImported}, Expenses: ${results.expenseImported}`,
      results,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Internal server error during import" },
      { status: 500 }
    );
  }
}
