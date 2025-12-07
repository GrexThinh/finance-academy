# Quick Setup Guide

## Prerequisites Checklist

Before running the application, make sure you have:

- [x] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] AWS Account with S3 bucket created
- [ ] AWS Access Key and Secret Key

## Step-by-Step Setup

### 1. Install Dependencies (Already Done ✓)

```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file with your actual credentials:

```env
# PostgreSQL Database
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/finance_academy?schema=public"

# NextAuth (generate a random secret)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# AWS S3 Credentials
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-actual-access-key"
AWS_SECRET_ACCESS_KEY="your-actual-secret-key"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

**To generate NEXTAUTH_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Setup PostgreSQL Database

**Option A: Using psql**

```bash
psql -U postgres
CREATE DATABASE finance_academy;
\q
```

**Option B: Using pgAdmin**

- Open pgAdmin
- Right-click on Databases
- Create > Database
- Name: `finance_academy`

### 4. Setup Prisma and Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

### 5. Import Data from Excel Files

Make sure these two Excel files are in the project root:

- `BÁO CÁO DASHBOARD (2023-2025).xlsx`
- `BÁO CÁO THU CHI DASHBOAD.xlsx`

Then run:

```bash
npm run import-data
```

This will:

- Create admin user (username: `admin`, password: `admin`)
- Import all income records
- Import all expense records

### 6. Run the Application

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

### 7. Login

Use these credentials:

- **Username**: `admin`
- **Password**: `admin`

## Troubleshooting

### Database Connection Error

If you see "Can't reach database server":

1. Make sure PostgreSQL is running
2. Check your DATABASE_URL in `.env`
3. Verify username and password are correct

### Prisma Error

If Prisma commands fail:

```bash
npx prisma generate
npx prisma db push
```

### AWS S3 Upload Error

1. Verify AWS credentials in `.env`
2. Check S3 bucket exists
3. Ensure IAM user has S3 permissions
4. Configure CORS on S3 bucket (see README.md)

### Import Data Error

If import fails:

1. Ensure Excel files are in project root directory
2. Check file names match exactly
3. Verify database is accessible

## Next Steps

After successful setup:

1. **Change Admin Password**: Create a new user or change admin password
2. **Configure AWS S3**: Set up your S3 bucket and update credentials
3. **Customize Data**: Add your own centers, programs, and categories
4. **Explore Features**: Try adding income/expense records, view charts, export data

## Production Deployment

For production deployment:

1. Use a production PostgreSQL database
2. Generate a strong NEXTAUTH_SECRET
3. Update NEXTAUTH_URL to your domain
4. Enable SSL for database connection
5. Set up proper AWS IAM roles
6. Configure environment variables on your hosting platform

## Need Help?

Check the main README.md for more detailed information.
