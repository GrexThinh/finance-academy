import { prisma } from "../lib/prisma";

async function testConnection() {
  console.log("🔍 Testing database connection...");

  try {
    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connection successful!");

    // Test partner table
    const partnerCount = await prisma.partner.count();
    console.log(`📊 Partners in database: ${partnerCount}`);

    // List all partners (for debugging)
    const partners = await prisma.partner.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        createdAt: true,
      },
    });

    console.log("🤝 Partners found:");
    partners.forEach((partner) => {
      console.log(`  - ${partner.name} (${partner.code || 'no code'})`);
    });

    // Test if we have any partners
    if (partners.length > 0) {
      console.log("✅ Partners exist in database");
    } else {
      console.log("ℹ️  No partners found (database is empty)");
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Check DATABASE_URL environment variable");
    console.log("2. Ensure database is accessible from current network");
    console.log("3. Verify database credentials are correct");
    console.log("4. Make sure SSL mode is set correctly (?sslmode=require)");
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
