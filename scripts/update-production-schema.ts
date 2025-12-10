import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@prisma/client";

// Production database connection
const productionConnectionString =
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL ||
  "postgres://cbb1b02275527dd9f979feeaffd122d6bb619d31369a1d8c6e88bc6b292dbf3d:sk_X419nBTdw1WD08JjUVyZv@db.prisma.io:5432/postgres?sslmode=require";

const productionPool = new Pool({ connectionString: productionConnectionString });
const productionAdapter = new PrismaPg(productionPool);
const productionPrisma = new PrismaClient({ adapter: productionAdapter });

async function updateProductionSchema() {
  console.log("🏗️ Updating production database schema...");

  try {
    // Create partners table (ignore if already exists)
    await productionPrisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "partners" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "code" TEXT UNIQUE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;

    // Add partnerId column to income_records table (ignore if already exists)
    try {
      await productionPrisma.$executeRaw`
        ALTER TABLE "income_records"
        ADD COLUMN IF NOT EXISTS "partnerId" TEXT;
      `;
    } catch (error) {
      console.log("⚠️ partnerId column might already exist");
    }

    // Add foreign key constraint (ignore if already exists)
    try {
      await productionPrisma.$executeRaw`
        ALTER TABLE "income_records"
        ADD CONSTRAINT "income_records_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL;
      `;
    } catch (error) {
      console.log("⚠️ income_records_partnerId_fkey constraint might already exist");
    }

    // Add index for partnerId (ignore if already exists)
    await productionPrisma.$executeRaw`CREATE INDEX IF NOT EXISTS "income_records_partnerId_idx" ON "income_records"("partnerId");`;

    console.log("✅ Production database schema updated successfully");
    console.log("📊 New features available:");
    console.log("   - Partners table created");
    console.log("   - Income records now support partner association");
    console.log("   - Foreign key relationships established");

  } catch (error) {
    console.error("❌ Schema update failed:", error);
    process.exit(1);
  } finally {
    await productionPrisma.$disconnect();
  }
}

// Run the schema update
if (require.main === module) {
  updateProductionSchema();
}
