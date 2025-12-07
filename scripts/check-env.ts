console.log("🔍 Environment Variables Check:");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Not set");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL ? "✅ Set" : "❌ Not set");
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Not set");

if (process.env.DATABASE_URL) {
  console.log("\n📋 DATABASE_URL Analysis:");
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`Protocol: ${url.protocol}`);
    console.log(`Host: ${url.host}`);
    console.log(`Database: ${url.pathname.slice(1)}`);
    console.log(`Username: ${url.username ? "✅ Set" : "❌ Missing"}`);
    console.log(`Password: ${url.password ? "✅ Set" : "❌ Missing"}`);
    console.log(`SSL Mode: ${url.searchParams.get("sslmode") || "Not specified"}`);
  } catch (error) {
    console.log("❌ Invalid DATABASE_URL format");
  }
} else {
  console.log("\n❌ DATABASE_URL is not set");
}

console.log("\n💡 Tips:");
console.log("- DATABASE_URL should look like: postgresql://user:password@host:5432/database?sslmode=require");
console.log("- For Vercel: Set DATABASE_URL in Environment Variables");
console.log("- For local: Create .env.local file with DATABASE_URL");
