import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateProgramIdOptional() {
  console.log(
    "🔄 Starting migration to make programId and revenue optional...\n"
  );

  try {
    // Make programId nullable
    console.log("1. Making programId nullable...");
    await prisma.$executeRaw`
      ALTER TABLE income_records 
      ALTER COLUMN "programId" DROP NOT NULL;
    `;
    console.log("   ✓ programId is now nullable\n");

    // Update the foreign key constraint to allow null
    console.log("2. Updating foreign key constraint...");
    try {
      await prisma.$executeRaw`
        ALTER TABLE income_records 
        DROP CONSTRAINT IF EXISTS "income_records_programId_fkey";
      `;
      await prisma.$executeRaw`
        ALTER TABLE income_records 
        ADD CONSTRAINT "income_records_programId_fkey" 
        FOREIGN KEY ("programId") 
        REFERENCES programs("id") 
        ON DELETE SET NULL;
      `;
      console.log("   ✓ Foreign key constraint updated\n");
    } catch (error: any) {
      if (error.code === "42710" || error.message?.includes("already exists")) {
        console.log("   ⚠️ Constraint already exists, skipping...\n");
      } else {
        throw error;
      }
    }

    // Make revenue nullable
    console.log("3. Making revenue nullable...");
    await prisma.$executeRaw`
      ALTER TABLE income_records 
      ALTER COLUMN "revenue" DROP NOT NULL;
    `;
    console.log("   ✓ revenue is now nullable\n");

    console.log("✅ Migration completed successfully!");
    console.log(
      "\nThe programId and revenue fields are now optional in the database."
    );
  } catch (error: any) {
    if (error.code === "42704" || error.message?.includes("does not exist")) {
      console.error("❌ Error: Column or constraint does not exist.");
      console.error(
        "   This might mean the database schema is different than expected."
      );
    } else if (
      error.code === "42P16" ||
      error.message?.includes("cannot be cast")
    ) {
      console.error("❌ Error: Cannot modify column constraint.");
      console.error("   The column might already be nullable.");
    } else {
      console.error("❌ Migration failed:", error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  migrateProgramIdOptional();
}

export default migrateProgramIdOptional;
