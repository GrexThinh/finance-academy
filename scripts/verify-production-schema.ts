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

async function verifyProductionSchema() {
  console.log("🔍 Verifying production database schema...");

  try {
    // Check if partners table exists and count records
    const partnerCount = await productionPrisma.partner.count();
    console.log(`📊 Partners table: ${partnerCount} records`);

    // Check if income_records table has partnerId column by trying to query it
    const incomeRecords = await productionPrisma.incomeRecord.findMany({
      take: 1,
      select: {
        id: true,
        partnerId: true,
      },
    });

    if (incomeRecords.length > 0 || incomeRecords.length === 0) {
      console.log("✅ Income records table has partnerId column");
    }

    // Test partner relationship by trying to create a test partner
    console.log("🧪 Testing partner creation...");
    const testPartner = await productionPrisma.partner.create({
      data: {
        name: "Test Partner - Migration Verification",
        code: "TEST_MIGRATION",
      },
    });
    console.log(`✅ Partner creation successful: ${testPartner.name}`);

    // Clean up test partner
    await productionPrisma.partner.delete({
      where: { id: testPartner.id },
    });
    console.log("🧹 Test partner cleaned up");

    console.log("🎉 Production database schema verification completed successfully!");
    console.log("🚀 Partner feature is ready to use!");

  } catch (error) {
    console.error("❌ Schema verification failed:", error);
    process.exit(1);
  } finally {
    await productionPrisma.$disconnect();
  }
}

// Run the verification
if (require.main === module) {
  verifyProductionSchema();
}
