@echo off
echo ========================================
echo Victoria Academy Finance - Quick Start Script
echo ========================================
echo.

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js is installed
echo.

echo [2/5] Checking if dependencies are installed...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo ✓ Dependencies already installed
)
echo.

echo [3/5] Checking Prisma Client...
if not exist "node_modules\.prisma\client" (
    echo Generating Prisma Client...
    call npm run db:generate
) else (
    echo ✓ Prisma Client already generated
)
echo.

echo [4/5] Environment Setup
echo.
echo Please make sure you have configured the .env file with:
echo   - PostgreSQL DATABASE_URL
echo   - NEXTAUTH_SECRET
echo   - AWS S3 credentials
echo.
echo Press any key to continue if .env is configured...
pause >nul
echo.

echo [5/5] Next Steps:
echo.
echo To setup the database, run:
echo   npm run db:push
echo.
echo To import data from Excel files, run:
echo   npm run import-data
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo ========================================
echo Setup complete! Check SETUP.md for detailed instructions.
echo ========================================
pause
