import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as XLSX from "xlsx";
import * as bcrypt from "bcryptjs";
import * as path from "path";

// Initialize Prisma client with PostgreSQL adapter (same as lib/prisma.ts)
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:password@localhost:5432/finance_academy?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function createTables() {
  // Create tables in correct order (respecting foreign keys)
  console.log("Creating centers table...");
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "centers" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "code" TEXT UNIQUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  console.log("Creating programs table...");
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "programs" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "code" TEXT UNIQUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  console.log("Creating users table...");
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT PRIMARY KEY,
      "username" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'USER',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  console.log("Creating income_records table...");
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "income_records" (
      "id" TEXT PRIMARY KEY,
      "month" INTEGER NOT NULL,
      "year" INTEGER NOT NULL,
      "centerId" TEXT NOT NULL,
      "programId" TEXT NOT NULL,
      "numberOfClasses" INTEGER NOT NULL DEFAULT 0,
      "numberOfStudents" INTEGER NOT NULL DEFAULT 0,
      "revenue" DECIMAL(15,2) NOT NULL,
      "status" TEXT,
      "notes" TEXT,
      "uploadedFileUrl" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  console.log("Creating expense_records table...");
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "expense_records" (
      "id" TEXT PRIMARY KEY,
      "month" INTEGER NOT NULL,
      "year" INTEGER NOT NULL,
      "centerId" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "item" TEXT NOT NULL,
      "position" TEXT,
      "contractType" TEXT,
      "hours" DECIMAL(10,2),
      "unitPrice" DECIMAL(15,2),
      "amount" DECIMAL(15,2) NOT NULL,
      "kilometers" DECIMAL(10,2),
      "travelAllowance" DECIMAL(15,2),
      "responsible" TEXT,
      "status" TEXT,
      "total" DECIMAL(15,2) NOT NULL,
      "notes" TEXT,
      "uploadedFileUrl" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  // Add foreign key constraints
  console.log("Adding foreign key constraints...");
  await prisma.$executeRaw`
    ALTER TABLE "income_records"
    ADD CONSTRAINT "income_records_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "centers"("id") ON DELETE CASCADE;
  `;
  await prisma.$executeRaw`
    ALTER TABLE "income_records"
    ADD CONSTRAINT "income_records_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE;
  `;
  await prisma.$executeRaw`
    ALTER TABLE "expense_records"
    ADD CONSTRAINT "expense_records_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "centers"("id") ON DELETE CASCADE;
  `;

  // Add indexes
  console.log("Adding indexes...");
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "income_records_centerId_idx" ON "income_records"("centerId");`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "income_records_programId_idx" ON "income_records"("programId");`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "income_records_year_month_idx" ON "income_records"("year", "month");`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "expense_records_centerId_idx" ON "expense_records"("centerId");`;
  await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "expense_records_year_month_idx" ON "expense_records"("year", "month");`;

  console.log("✅ Database tables created successfully");
}

async function main() {
  console.log("Starting data import...");

  // Create tables first
  console.log("Creating database tables...");
  await createTables();

  // Create default admin user
  console.log("Creating admin user...");
  const hashedPassword = await bcrypt.hash("admin", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      name: "Administrator",
      role: "ADMIN",
    },
  });
  console.log("✓ Admin user created (username: admin, password: admin)");

  // Import data from Excel files
  const file1Path = path.join(
    process.cwd(),
    "BÁO CÁO DASHBOARD (2023-2025).xlsx"
  );
  const file2Path = path.join(process.cwd(), "BÁO CÁO THU CHI DASHBOAD.xlsx");

  try {
    // Import income data from File 1 - DATA sheet
    console.log("\nImporting income data from File 1...");
    const workbook1 = XLSX.readFile(file1Path);
    const dataSheet = workbook1.Sheets["DATA"];

    if (dataSheet) {
      const incomeData = XLSX.utils.sheet_to_json(dataSheet);

      for (const row of incomeData as any[]) {
        if (!row["THÁNG"] || !row["TRUNG TÂM"] || !row["CHƯƠNG TRINH"])
          continue;

        // Create or get center
        const center = await prisma.center.upsert({
          where: { name: row["TRUNG TÂM"].toString().trim() },
          update: {},
          create: { name: row["TRUNG TÂM"].toString().trim() },
        });

        // Create or get program
        const program = await prisma.program.upsert({
          where: { name: row["CHƯƠNG TRINH"].toString().trim() },
          update: {},
          create: { name: row["CHƯƠNG TRINH"].toString().trim() },
        });

        // Create income record
        const monthValue = row["THÁNG"];
        let month = 1;

        if (typeof monthValue === "number") {
          // If it's a large number, it might be an Excel date serial
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

        const incomeData = {
          month: month,
          year: 2024, // Default year, adjust as needed
          centerId: center.id,
          programId: program.id,
          numberOfClasses: parseInt(row["SỐ LỚP"]) || 0,
          numberOfStudents: parseInt(row["SỐ HỌC VIÊN"]) || 0,
          revenue: parseFloat(row["DOANH THU"]) || 0,
        };

        // Create income record using raw SQL
        await prisma.$executeRaw`
          INSERT INTO income_records (id, month, year, "centerId", "programId", revenue, "numberOfClasses", "numberOfStudents")
          VALUES (${crypto.randomUUID()}, ${incomeData.month}, ${
          incomeData.year
        }, ${incomeData.centerId}, ${incomeData.programId}, ${
          incomeData.revenue
        }, ${incomeData.numberOfClasses}, ${incomeData.numberOfStudents})
        `;
      }
      console.log(`✓ Imported ${incomeData.length} income records`);
    }

    // Import expense data from File 2 - CHI sheet
    console.log("\nImporting expense data from File 2...");
    const workbook2 = XLSX.readFile(file2Path);
    const chiSheet = workbook2.Sheets["CHI"];

    if (chiSheet) {
      const expenseData = XLSX.utils.sheet_to_json(chiSheet);

      for (const row of expenseData as any[]) {
        if (
          !row["THÁNG"] ||
          !row["TRUNG TÂM"] ||
          !row["KHOẢN CHI"] ||
          !row["HẠNG MỤC"]
        )
          continue;

        // Create or get center
        const center = await prisma.center.upsert({
          where: { name: row["TRUNG TÂM"].toString().trim() },
          update: {},
          create: { name: row["TRUNG TÂM"].toString().trim() },
        });

        // Use category and item as free text (no separate tables needed)

        // Create expense record
        const amount = parseFloat(row["THÀNH TIỀN"]) || 0;
        const travelAllowance = parseFloat(row["PC DI CHUYỂN"]) || 0;
        const total = parseFloat(row["TỔNG"]) || amount + travelAllowance;

        const expenseMonthValue = row["THÁNG"];
        let expenseMonth = 1;

        if (typeof expenseMonthValue === "number") {
          if (expenseMonthValue > 12) {
            const excelDate = new Date(
              (expenseMonthValue - 25569) * 86400 * 1000
            );
            expenseMonth = excelDate.getMonth() + 1;
          } else {
            expenseMonth = Math.max(1, Math.min(12, expenseMonthValue));
          }
        } else if (typeof expenseMonthValue === "string") {
          expenseMonth = parseInt(expenseMonthValue) || 1;
          expenseMonth = Math.max(1, Math.min(12, expenseMonth));
        }

        // Create expense record using raw SQL
        await prisma.$executeRaw`
          INSERT INTO expense_records (id, month, year, "centerId", category, item, position, "contractType", hours, "unitPrice", amount, kilometers, "travelAllowance", responsible, status, total, notes)
          VALUES (
            ${crypto.randomUUID()},
            ${expenseMonth},
            2024,
            ${center.id},
            ${row["KHOẢN CHI"].toString().trim()},
            ${row["HẠNG MỤC"].toString().trim()},
            ${row["CHỨC VỤ"]?.toString() || null},
            ${row["LOẠI HD"]?.toString() || null},
            ${row["SỐ GIỜ"] ? parseFloat(row["SỐ GIỜ"]) : null},
            ${row["ĐƠN GIÁ"] ? parseFloat(row["ĐƠN GIÁ"]) : null},
            ${amount},
            ${row["SỐ KM"] ? parseFloat(row["SỐ KM"]) : null},
            ${travelAllowance || null},
            ${row["PHỤ TRÁCH"]?.toString() || null},
            ${row["TÌNH TRẠNG"]?.toString() || null},
            ${total},
            ${row["GHI CHÚ"]?.toString() || null}
          )
        `;
      }
      console.log(`✓ Imported ${expenseData.length} expense records`);
    }

    console.log("\n✅ Data import completed successfully!");
  } catch (error) {
    console.error("Error importing data:", error);
    console.log(
      "\n⚠️  Note: Make sure the Excel files are in the project root directory"
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
