import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

// Local database connection (source) - temporarily use this for local DB
const localConnectionString =
  process.env.DATABASE_URL_LOCAL ||
  "postgresql://postgres:password@localhost:5432/finance_academy?schema=public";

// Production database connection (target) - your Prisma Postgres database
const productionConnectionString =
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgres://cbb1b02275527dd9f979feeaffd122d6bb619d31369a1d8c6e88bc6b292dbf3d:sk_X419nBTdw1WD08JjUVyZv@db.prisma.io:5432/postgres?sslmode=require";

const productionPool = new Pool({
  connectionString: productionConnectionString,
});
const productionAdapter = new PrismaPg(productionPool);
const productionPrisma = new PrismaClient({ adapter: productionAdapter });

interface MigrationData {
  centers: any[];
  programs: any[];
  partners: any[];
  incomeRecords: any[];
  expenseRecords: any[];
}

async function loadFromBackup(): Promise<MigrationData> {
  console.log("📤 Loading data from backup file...");

  const backupPath = path.join(process.cwd(), "migration-backup.json");

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }

  const backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"));

  const data: MigrationData = {
    centers: backupData.centers || [],
    programs: backupData.programs || [],
    partners: backupData.partners || [],
    incomeRecords: backupData.incomeRecords || [],
    expenseRecords: backupData.expenseRecords || [],
  };

  console.log(
    `✅ Loaded ${data.centers.length} centers, ${data.programs.length} programs, ${data.partners.length} partners`
  );
  console.log(
    `   ${data.incomeRecords.length} income records, ${data.expenseRecords.length} expense records`
  );

  return data;
}

async function setupProductionSchema() {
  console.log("🏗️ Setting up production database schema...");

  try {
  } catch (error) {
    console.log("⚠️ UserRole enum might already exist, continuing...");
  }

  // Create tables in correct order (ignore if already exists)
  await productionPrisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "centers" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "code" TEXT UNIQUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await productionPrisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "programs" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "code" TEXT UNIQUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await productionPrisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "partners" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "code" TEXT UNIQUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await productionPrisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "income_records" (
      "id" TEXT PRIMARY KEY,
      "month" INTEGER NOT NULL,
      "year" INTEGER NOT NULL,
      "centerId" TEXT NOT NULL,
      "programId" TEXT NOT NULL,
      "partnerId" TEXT,
      "numberOfClasses" INTEGER NOT NULL DEFAULT 0,
      "numberOfStudents" INTEGER NOT NULL DEFAULT 0,
      "revenue" DECIMAL(15,2) NOT NULL,
      "status" TEXT,
      "notes" TEXT,
      "uploadedFileUrl" TEXT,
      "tuitionFeeFullYear" DECIMAL(15,2),
      "tuitionFeeHalfYear" DECIMAL(15,2),
      "tuitionFeeDiscount" DECIMAL(15,2),
      "tuitionFeeOld" DECIMAL(15,2),
      "sessionCount" INTEGER,
      "sessionCountNew" INTEGER,
      "numClassesHalfFee" INTEGER,
      "numClassesFullFee" INTEGER,
      "numStudentsHalfFee" INTEGER,
      "numStudentsFullFee" INTEGER,
      "numDiscountedStudents" INTEGER,
      "discount" DECIMAL(15,2),
      "payType" TEXT,
      "oldStudent" TEXT,
      "freeStudentCount" INTEGER,
      "totalTuitionFee" DECIMAL(15,2),
      "facilitiesFee" DECIMAL(15,2),
      "adminDeduction" DECIMAL(15,2),
      "agentCommission" DECIMAL(15,2),
      "teacherDeduction" DECIMAL(15,2),
      "totalDeduction" DECIMAL(15,2),
      "actualReceivable" DECIMAL(15,2),
      "submittedToCenter" DECIMAL(15,2),
      "collectionDate" TIMESTAMP,
      "difference" DECIMAL(15,2),
      "selfEnrollCount" INTEGER,
      "retentionRate" TEXT,
      "staffInvolved" TEXT,
      "hrRetention" TEXT,
      "hrContract" TEXT,
      "schoolDeductionMethod" TEXT,
      "centerDeductionMethod" TEXT,
      "contractStatus" TEXT,
      "teacherRate" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await productionPrisma.$executeRaw`
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

  // Add foreign key constraints (ignore if already exists)
  try {
    await productionPrisma.$executeRaw`
      ALTER TABLE "income_records"
      ADD CONSTRAINT "income_records_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "centers"("id") ON DELETE CASCADE;
    `;
  } catch (error) {
    console.log(
      "⚠️ income_records_centerId_fkey constraint might already exist"
    );
  }

  try {
    await productionPrisma.$executeRaw`
      ALTER TABLE "income_records"
      ADD CONSTRAINT "income_records_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE;
    `;
  } catch (error) {
    console.log(
      "⚠️ income_records_programId_fkey constraint might already exist"
    );
  }

  try {
    await productionPrisma.$executeRaw`
      ALTER TABLE "income_records"
      ADD CONSTRAINT "income_records_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL;
    `;
  } catch (error) {
    console.log(
      "⚠️ income_records_partnerId_fkey constraint might already exist"
    );
  }

  try {
    await productionPrisma.$executeRaw`
      ALTER TABLE "expense_records"
      ADD CONSTRAINT "expense_records_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "centers"("id") ON DELETE CASCADE;
    `;
  } catch (error) {
    console.log(
      "⚠️ expense_records_centerId_fkey constraint might already exist"
    );
  }

  // Add indexes (ignore if already exists)
  await productionPrisma.$executeRaw`CREATE INDEX IF NOT EXISTS "income_records_centerId_idx" ON "income_records"("centerId");`;
  await productionPrisma.$executeRaw`CREATE INDEX IF NOT EXISTS "income_records_programId_idx" ON "income_records"("programId");`;
  await productionPrisma.$executeRaw`CREATE INDEX IF NOT EXISTS "income_records_partnerId_idx" ON "income_records"("partnerId");`;
  await productionPrisma.$executeRaw`CREATE INDEX IF NOT EXISTS "income_records_year_month_idx" ON "income_records"("year", "month");`;
  await productionPrisma.$executeRaw`CREATE INDEX IF NOT EXISTS "expense_records_centerId_idx" ON "expense_records"("centerId");`;
  await productionPrisma.$executeRaw`CREATE INDEX IF NOT EXISTS "expense_records_year_month_idx" ON "expense_records"("year", "month");`;

  console.log("✅ Production database schema ready");
}

async function importToProduction(data: MigrationData) {
  console.log("📥 Importing data to production database...");

  // Import centers first (no dependencies)
  console.log("Importing centers...");
  for (const center of data.centers) {
    await productionPrisma.center.upsert({
      where: { id: center.id },
      update: {
        name: center.name,
        code: center.code,
        updatedAt: new Date(center.updatedAt),
      },
      create: {
        id: center.id,
        name: center.name,
        code: center.code,
        createdAt: new Date(center.createdAt),
        updatedAt: new Date(center.updatedAt),
      },
    });
  }

  // Import programs (no dependencies)
  console.log("Importing programs...");
  for (const program of data.programs) {
    await productionPrisma.program.upsert({
      where: { id: program.id },
      update: {
        name: program.name,
        code: program.code,
        updatedAt: new Date(program.updatedAt),
      },
      create: {
        id: program.id,
        name: program.name,
        code: program.code,
        createdAt: new Date(program.createdAt),
        updatedAt: new Date(program.updatedAt),
      },
    });
  }

  // Import partners (no dependencies)
  console.log("Importing partners...");
  for (const partner of data.partners) {
    await productionPrisma.partner.upsert({
      where: { id: partner.id },
      update: {
        name: partner.name,
        code: partner.code,
        updatedAt: new Date(partner.updatedAt),
      },
      create: {
        id: partner.id,
        name: partner.name,
        code: partner.code,
        createdAt: new Date(partner.createdAt),
        updatedAt: new Date(partner.updatedAt),
      },
    });
  }

  // Import income records (depends on centers, programs, and partners)
  console.log("Importing income records...");
  for (const record of data.incomeRecords) {
    await productionPrisma.incomeRecord.upsert({
      where: { id: record.id },
      update: {
        month: record.month,
        year: record.year,
        centerId: record.centerId,
        programId: record.programId,
        partnerId: record.partnerId,
        numberOfClasses: record.numberOfClasses,
        numberOfStudents: record.numberOfStudents,
        revenue: record.revenue,
        status: record.status,
        notes: record.notes,
        uploadedFileUrl: record.uploadedFileUrl,
        tuitionFeeFullYear: record.tuitionFeeFullYear,
        tuitionFeeHalfYear: record.tuitionFeeHalfYear,
        tuitionFeeDiscount: record.tuitionFeeDiscount,
        tuitionFeeOld: record.tuitionFeeOld,
        sessionCount: record.sessionCount,
        sessionCountNew: record.sessionCountNew,
        numClassesHalfFee: record.numClassesHalfFee,
        numClassesFullFee: record.numClassesFullFee,
        numStudentsHalfFee: record.numStudentsHalfFee,
        numStudentsFullFee: record.numStudentsFullFee,
        numDiscountedStudents: record.numDiscountedStudents,
        discount: record.discount,
        payType: record.payType,
        oldStudent: record.oldStudent,
        freeStudentCount: record.freeStudentCount,
        totalTuitionFee: record.totalTuitionFee,
        facilitiesFee: record.facilitiesFee,
        adminDeduction: record.adminDeduction,
        agentCommission: record.agentCommission,
        teacherDeduction: record.teacherDeduction,
        totalDeduction: record.totalDeduction,
        actualReceivable: record.actualReceivable,
        submittedToCenter: record.submittedToCenter,
        collectionDate: record.collectionDate
          ? new Date(record.collectionDate)
          : null,
        difference: record.difference,
        selfEnrollCount: record.selfEnrollCount,
        retentionRate: record.retentionRate,
        staffInvolved: record.staffInvolved,
        hrRetention: record.hrRetention,
        hrContract: record.hrContract,
        schoolDeductionMethod: record.schoolDeductionMethod,
        centerDeductionMethod: record.centerDeductionMethod,
        contractStatus: record.contractStatus,
        teacherRate: record.teacherRate,
        updatedAt: new Date(record.updatedAt),
      },
      create: {
        id: record.id,
        month: record.month,
        year: record.year,
        centerId: record.centerId,
        programId: record.programId,
        partnerId: record.partnerId,
        numberOfClasses: record.numberOfClasses,
        numberOfStudents: record.numberOfStudents,
        revenue: record.revenue,
        status: record.status,
        notes: record.notes,
        uploadedFileUrl: record.uploadedFileUrl,
        tuitionFeeFullYear: record.tuitionFeeFullYear,
        tuitionFeeHalfYear: record.tuitionFeeHalfYear,
        tuitionFeeDiscount: record.tuitionFeeDiscount,
        tuitionFeeOld: record.tuitionFeeOld,
        sessionCount: record.sessionCount,
        sessionCountNew: record.sessionCountNew,
        numClassesHalfFee: record.numClassesHalfFee,
        numClassesFullFee: record.numClassesFullFee,
        numStudentsHalfFee: record.numStudentsHalfFee,
        numStudentsFullFee: record.numStudentsFullFee,
        numDiscountedStudents: record.numDiscountedStudents,
        discount: record.discount,
        payType: record.payType,
        oldStudent: record.oldStudent,
        freeStudentCount: record.freeStudentCount,
        totalTuitionFee: record.totalTuitionFee,
        facilitiesFee: record.facilitiesFee,
        adminDeduction: record.adminDeduction,
        agentCommission: record.agentCommission,
        teacherDeduction: record.teacherDeduction,
        totalDeduction: record.totalDeduction,
        actualReceivable: record.actualReceivable,
        submittedToCenter: record.submittedToCenter,
        collectionDate: record.collectionDate
          ? new Date(record.collectionDate)
          : null,
        difference: record.difference,
        selfEnrollCount: record.selfEnrollCount,
        retentionRate: record.retentionRate,
        staffInvolved: record.staffInvolved,
        hrRetention: record.hrRetention,
        hrContract: record.hrContract,
        schoolDeductionMethod: record.schoolDeductionMethod,
        centerDeductionMethod: record.centerDeductionMethod,
        contractStatus: record.contractStatus,
        teacherRate: record.teacherRate,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
      },
    });
  }

  // Import expense records (depends on centers)
  console.log("Importing expense records...");
  for (const record of data.expenseRecords) {
    await productionPrisma.expenseRecord.upsert({
      where: { id: record.id },
      update: {
        month: record.month,
        year: record.year,
        centerId: record.centerId,
        category: record.category,
        item: record.item,
        position: record.position,
        contractType: record.contractType,
        hours: record.hours,
        unitPrice: record.unitPrice,
        amount: record.amount,
        kilometers: record.kilometers,
        travelAllowance: record.travelAllowance,
        responsible: record.responsible,
        status: record.status,
        total: record.total,
        notes: record.notes,
        uploadedFileUrl: record.uploadedFileUrl,
        updatedAt: new Date(record.updatedAt),
      },
      create: {
        id: record.id,
        month: record.month,
        year: record.year,
        centerId: record.centerId,
        category: record.category,
        item: record.item,
        position: record.position,
        contractType: record.contractType,
        hours: record.hours,
        unitPrice: record.unitPrice,
        amount: record.amount,
        kilometers: record.kilometers,
        travelAllowance: record.travelAllowance,
        responsible: record.responsible,
        status: record.status,
        total: record.total,
        notes: record.notes,
        uploadedFileUrl: record.uploadedFileUrl,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
      },
    });
  }

  console.log("✅ Data import completed");
}

async function verifyMigration() {
  console.log("🔍 Verifying migration...");

  const centerCount = await productionPrisma.center.count();
  const programCount = await productionPrisma.program.count();
  const partnerCount = await productionPrisma.partner.count();
  const incomeCount = await productionPrisma.incomeRecord.count();
  const expenseCount = await productionPrisma.expenseRecord.count();

  console.log("Production database counts:");
  console.log(`  Centers: ${centerCount}`);
  console.log(`  Programs: ${programCount}`);
  console.log(`  Partners: ${partnerCount}`);
  console.log(`  Income Records: ${incomeCount}`);
  console.log(`  Expense Records: ${expenseCount}`);
}

async function main() {
  try {
    console.log(
      "🚀 Starting database migration from backup to production...\n"
    );

    // Step 1: Load data from backup file
    const migrationData = await loadFromBackup();
    console.log("");

    // Step 2: Set up production schema
    await setupProductionSchema();
    console.log("");

    // Step 3: Import data to production
    await importToProduction(migrationData);
    console.log("");

    // Step 4: Verify migration
    await verifyMigration();
    console.log("");

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await productionPrisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  main();
}
