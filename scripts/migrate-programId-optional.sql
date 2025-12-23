-- Migration script to make programId optional in income_records table
-- Run this script in your PostgreSQL database to update the schema

-- Make programId nullable
ALTER TABLE income_records 
ALTER COLUMN "programId" DROP NOT NULL;

-- Update the foreign key constraint to allow null
-- (The constraint should already allow null, but we'll ensure it's set correctly)
ALTER TABLE income_records 
DROP CONSTRAINT IF EXISTS "income_records_programId_fkey";

ALTER TABLE income_records 
ADD CONSTRAINT "income_records_programId_fkey" 
FOREIGN KEY ("programId") 
REFERENCES programs("id") 
ON DELETE SET NULL;

-- Make revenue nullable (if not already)
ALTER TABLE income_records 
ALTER COLUMN "revenue" DROP NOT NULL;
