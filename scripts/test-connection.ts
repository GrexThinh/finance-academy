import { prisma } from "../lib/prisma";

async function testConnection() {
  console.log("🔍 Testing database connection...");

  try {
    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connection successful!");

    // Test user table
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);

    // List all users (for debugging)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log("👥 Users found:");
    users.forEach((user) => {
      console.log(`  - ${user.username} (${user.role})`);
    });

    // Test if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { username: "admin" },
    });

    if (adminUser) {
      console.log("✅ Admin user exists");
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Role: ${adminUser.role}`);
    } else {
      console.log("❌ Admin user not found");
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
