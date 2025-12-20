<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
<<<<<<< HEAD
=======
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

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
>>>>>>> 1715de4 (update)
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
    }

    // Validate file type
    const allowedTypes = [
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only Excel files (.xlsx, .xls) are allowed.' },
        { status: 400 }
      )
<<<<<<< HEAD
=======
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
>>>>>>> 1715de4 (update)
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
    }

    // Validate file size (max 50MB for Excel files)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Convert file to buffer for processing
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
<<<<<<< HEAD
=======
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // Optionally store the uploaded file in S3
    const storeFile = formData.get("storeFile") === "true";
    let fileUrl = null;

    if (storeFile) {
      try {
        fileUrl = await uploadFileToS3(file, "imports");
      } catch (uploadError) {
        console.error("Error storing import file:", uploadError);
        // Continue with import even if file storage fails
      }
    }

    // Convert file to buffer for processing
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
>>>>>>> 1715de4 (update)
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c

    const results = {
      incomeImported: 0,
      expenseImported: 0,
      errors: [] as string[],
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
    }

    // Process income data from "DATA" sheet
    const dataSheet = workbook.Sheets['DATA']
    if (dataSheet) {
      try {
        const incomeData = XLSX.utils.sheet_to_json(dataSheet) as any[]
<<<<<<< HEAD
=======
    };

    // Process income data from "DATA" sheet
    const dataSheet = workbook.Sheets["DATA"];
    if (dataSheet) {
      try {
        const incomeData = XLSX.utils.sheet_to_json(dataSheet) as any[];
>>>>>>> 1715de4 (update)
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c

        for (const row of incomeData) {
          try {
            // Skip empty rows
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
            if (!row['THÁNG'] || !row['TRUNG TÂM'] || !row['CHƯƠNG TRINH']) {
              continue
            }

            // Create or get center
            const centerName = row['TRUNG TÂM']?.toString().trim()
            if (!centerName) continue

            let center = await prisma.center.findUnique({
              where: { name: centerName }
            })

            if (!center) {
              center = await prisma.center.create({
                data: { name: centerName }
              })
            }

            // Create or get program
            const programName = row['CHƯƠNG TRINH']?.toString().trim()
            if (!programName) continue

            let program = await prisma.program.findUnique({
              where: { name: programName }
            })

            if (!program) {
              program = await prisma.program.create({
                data: { name: programName }
              })
            }

            // Parse month
            const monthValue = row['THÁNG']
            let month = 1

            if (typeof monthValue === 'number') {
              if (monthValue > 12) {
                // Convert Excel date serial to month
                const excelDate = new Date((monthValue - 25569) * 86400 * 1000)
                month = excelDate.getMonth() + 1
              } else {
                month = Math.max(1, Math.min(12, monthValue))
              }
            } else if (typeof monthValue === 'string') {
              month = parseInt(monthValue) || 1
              month = Math.max(1, Math.min(12, month))
            }

            // Parse other fields
            const numberOfClasses = parseInt(row['SỐ LỚP']) || 0
            const numberOfStudents = parseInt(row['SỐ HỌC VIÊN']) || 0
            const revenue = parseFloat(row['DOANH THU']) || 0
<<<<<<< HEAD
=======
            if (!row["THÁNG"] || !row["TRUNG TÂM"] || !row["CHƯƠNG TRINH"]) {
              continue;
            }

            // Create or get center
            const centerName = row["TRUNG TÂM"]?.toString().trim();
            if (!centerName) continue;

            let center = await prisma.center.findUnique({
              where: { name: centerName },
            });

            if (!center) {
              center = await prisma.center.create({
                data: { name: centerName },
              });
            }

            // Create or get program
            const programName = row["CHƯƠNG TRINH"]?.toString().trim();
            if (!programName) continue;

            let program = await prisma.program.findUnique({
              where: { name: programName },
            });

            if (!program) {
              program = await prisma.program.create({
                data: { name: programName },
              });
            }

            // Parse month
            const monthValue = row["THÁNG"];
            let month = 1;

            if (typeof monthValue === "number") {
              if (monthValue > 12) {
                // Convert Excel date serial to month
                const excelDate = new Date((monthValue - 25569) * 86400 * 1000);
                month = excelDate.getMonth() + 1;
              } else {
                month = Math.max(1, Math.min(12, monthValue));
              }
            } else if (typeof monthValue === "string") {
              month = parseInt(monthValue) || 1;
              month = Math.max(1, Math.min(12, month));
            }

            // Parse other fields
            const numberOfClasses = parseInt(row["SỐ LỚP"]) || 0;
            const numberOfStudents = parseInt(row["SỐ HỌC VIÊN"]) || 0;
            const revenue = parseFloat(row["DOANH THU"]) || 0;
>>>>>>> 1715de4 (update)
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c

            // Create income record
            await prisma.incomeRecord.create({
              data: {
                month,
                year: 2024, // Default year, can be made configurable
                centerId: center.id,
                programId: program.id,
                numberOfClasses,
                numberOfStudents,
                revenue,
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
              }
            })

            results.incomeImported++
          } catch (rowError) {
            console.error('Error processing income row:', row, rowError)
            results.errors.push(`Income row error: ${rowError}`)
          }
        }
      } catch (sheetError) {
        console.error('Error processing DATA sheet:', sheetError)
        results.errors.push(`DATA sheet error: ${sheetError}`)
<<<<<<< HEAD
=======
              },
            });

            results.incomeImported++;
          } catch (rowError) {
            console.error("Error processing income row:", row, rowError);
            results.errors.push(`Income row error: ${rowError}`);
          }
        }
      } catch (sheetError) {
        console.error("Error processing DATA sheet:", sheetError);
        results.errors.push(`DATA sheet error: ${sheetError}`);
>>>>>>> 1715de4 (update)
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
      }
    }

    // Process expense data from "CHI" sheet
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
    const chiSheet = workbook.Sheets['CHI']
    if (chiSheet) {
      try {
        const expenseData = XLSX.utils.sheet_to_json(chiSheet) as any[]
<<<<<<< HEAD
=======
    const chiSheet = workbook.Sheets["CHI"];
    if (chiSheet) {
      try {
        const expenseData = XLSX.utils.sheet_to_json(chiSheet) as any[];
>>>>>>> 1715de4 (update)
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c

        for (const row of expenseData) {
          try {
            // Skip empty rows
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
            if (!row['THÁNG'] || !row['TRUNG TÂM'] || !row['KHOẢN CHI'] || !row['HẠNG MỤC']) {
              continue
            }

            // Create or get center
            const centerName = row['TRUNG TÂM']?.toString().trim()
            if (!centerName) continue

            let center = await prisma.center.findUnique({
              where: { name: centerName }
            })

            if (!center) {
              center = await prisma.center.create({
                data: { name: centerName }
              })
            }

            // Parse month
            const monthValue = row['THÁNG']
            let month = 1

            if (typeof monthValue === 'number') {
              if (monthValue > 12) {
                const excelDate = new Date((monthValue - 25569) * 86400 * 1000)
                month = excelDate.getMonth() + 1
              } else {
                month = Math.max(1, Math.min(12, monthValue))
              }
            } else if (typeof monthValue === 'string') {
              month = parseInt(monthValue) || 1
              month = Math.max(1, Math.min(12, month))
            }

            // Parse amounts
            const amount = parseFloat(row['THÀNH TIỀN']) || 0
            const travelAllowance = parseFloat(row['PC DI CHUYỂN']) || 0
            const total = parseFloat(row['TỔNG']) || (amount + travelAllowance)
<<<<<<< HEAD
=======
            if (
              !row["THÁNG"] ||
              !row["TRUNG TÂM"] ||
              !row["KHOẢN CHI"] ||
              !row["HẠNG MỤC"]
            ) {
              continue;
            }

            // Create or get center
            const centerName = row["TRUNG TÂM"]?.toString().trim();
            if (!centerName) continue;

            let center = await prisma.center.findUnique({
              where: { name: centerName },
            });

            if (!center) {
              center = await prisma.center.create({
                data: { name: centerName },
              });
            }

            // Parse month
            const monthValue = row["THÁNG"];
            let month = 1;

            if (typeof monthValue === "number") {
              if (monthValue > 12) {
                const excelDate = new Date((monthValue - 25569) * 86400 * 1000);
                month = excelDate.getMonth() + 1;
              } else {
                month = Math.max(1, Math.min(12, monthValue));
              }
            } else if (typeof monthValue === "string") {
              month = parseInt(monthValue) || 1;
              month = Math.max(1, Math.min(12, month));
            }

            // Parse amounts
            const amount = parseFloat(row["THÀNH TIỀN"]) || 0;
            const travelAllowance = parseFloat(row["PC DI CHUYỂN"]) || 0;
            const total = parseFloat(row["TỔNG"]) || amount + travelAllowance;
>>>>>>> 1715de4 (update)
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c

            // Create expense record
            await prisma.expenseRecord.create({
              data: {
                month,
                year: 2024, // Default year, can be made configurable
                centerId: center.id,
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
                category: row['KHOẢN CHI']?.toString().trim() || '',
                item: row['HẠNG MỤC']?.toString().trim() || '',
                position: row['CHỨC VỤ']?.toString() || null,
                contractType: row['LOẠI HD']?.toString() || null,
                hours: row['SỐ GIỜ'] ? parseFloat(row['SỐ GIỜ']) : null,
                unitPrice: row['ĐƠN GIÁ'] ? parseFloat(row['ĐƠN GIÁ']) : null,
                amount,
                kilometers: row['SỐ KM'] ? parseFloat(row['SỐ KM']) : null,
                travelAllowance: travelAllowance || null,
                responsible: row['PHỤ TRÁCH']?.toString() || null,
                status: row['TÌNH TRẠNG']?.toString() || null,
                total,
                notes: row['GHI CHÚ']?.toString() || null,
              }
            })

            results.expenseImported++
          } catch (rowError) {
            console.error('Error processing expense row:', row, rowError)
            results.errors.push(`Expense row error: ${rowError}`)
          }
        }
      } catch (sheetError) {
        console.error('Error processing CHI sheet:', sheetError)
        results.errors.push(`CHI sheet error: ${sheetError}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed. Income: ${results.incomeImported}, Expense: ${results.expenseImported}`,
      results,
    })

  } catch (error) {
    console.error('Error importing Excel file:', error)
    return NextResponse.json(
      { error: 'Failed to import Excel file' },
      { status: 500 }
    )
<<<<<<< HEAD
=======
                category: row["KHOẢN CHI"]?.toString().trim() || "",
                item: row["HẠNG MỤC"]?.toString().trim() || "",
                position: row["CHỨC VỤ"]?.toString() || null,
                contractType: row["LOẠI HD"]?.toString() || null,
                hours: row["SỐ GIỜ"] ? parseFloat(row["SỐ GIỜ"]) : null,
                unitPrice: row["ĐƠN GIÁ"] ? parseFloat(row["ĐƠN GIÁ"]) : null,
                amount,
                kilometers: row["SỐ KM"] ? parseFloat(row["SỐ KM"]) : null,
                travelAllowance: travelAllowance || null,
                responsible: row["PHỤ TRÁCH"]?.toString() || null,
                status: row["TÌNH TRẠNG"]?.toString() || null,
                total,
                notes: row["GHI CHÚ"]?.toString() || null,
              },
            });

            results.expenseImported++;
          } catch (rowError) {
            console.error("Error processing expense row:", row, rowError);
            results.errors.push(`Expense row error: ${rowError}`);
          }
        }
      } catch (sheetError) {
        console.error("Error processing CHI sheet:", sheetError);
        results.errors.push(`CHI sheet error: ${sheetError}`);
      }
    }

    const response: any = {
      success: true,
      message: `Import completed. Income: ${results.incomeImported}, Expense: ${results.expenseImported}`,
      results,
    };

    if (fileUrl) {
      response.fileUrl = fileUrl;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error importing Excel file:", error);
    return NextResponse.json(
      { error: "Failed to import Excel file" },
      { status: 500 }
    );
>>>>>>> 1715de4 (update)
=======
>>>>>>> eabdfa0f6b2373f5c9ab4bb8c6053a86a3bff72c
  }
}
