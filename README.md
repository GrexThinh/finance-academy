# Victoria Academy Finance - Hệ Thống Quản Lý Tài Chính

Ứng dụng quản lý tài chính toàn diện cho các trung tâm đào tạo, theo dõi thu nhập, chi phí, và phân tích lợi nhuận.

## 🚀 Tính năng

- ✅ **Quản lý thu nhập**: Theo dõi doanh thu từ các trung tâm và chương trình
- ✅ **Quản lý chi phí**: Quản lý chi tiết các khoản chi theo trung tâm
- ✅ **Phân tích lợi nhuận/lỗ**: Báo cáo và biểu đồ lợi nhuận theo trung tâm
- ✅ **Biểu đồ trực quan**: Sử dụng Recharts để hiển thị dữ liệu
- ✅ **Xuất Excel**: Xuất báo cáo ra file Excel
- ✅ **Tải file lên S3**: Lưu trữ file đính kèm trên AWS S3
- ✅ **Xác thực**: Đăng nhập bằng username/password với NextAuth
- ✅ **Responsive**: Giao diện thân thiện trên mọi thiết bị

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL với Prisma ORM
- **Authentication**: NextAuth.js v5
- **File Storage**: AWS S3
- **Charts**: Recharts
- **Export**: xlsx library

## 📋 Yêu cầu

- Node.js 18+
- PostgreSQL 14+
- AWS Account (cho S3)
- npm hoặc yarn

## 🔧 Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
cd finance-academy
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong file `.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/finance_academy?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET_NAME="finance-academy-uploads"
```

### 3. Thiết lập PostgreSQL

Tạo database:

```bash
createdb finance_academy
```

Hoặc sử dụng psql:

```sql
CREATE DATABASE finance_academy;
```

### 4. Chạy Prisma migrations

```bash
npm run db:generate
npm run db:push
```

### 5. Import dữ liệu từ Excel (tùy chọn)

Đảm bảo 2 file Excel đang ở thư mục gốc của project:

- `BÁO CÁO DASHBOARD (2023-2025).xlsx`
- `BÁO CÁO THU CHI DASHBOAD.xlsx`

Chạy script import:

```bash
npm run import-data
```

Script này sẽ:

- Tạo user admin (username: `admin`, password: `admin`)
- Import dữ liệu thu nhập từ file Excel
- Import dữ liệu chi phí từ file Excel

### 6. Chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt và truy cập: `http://localhost:3000`

## 👤 Đăng nhập

Sau khi import dữ liệu, sử dụng thông tin sau để đăng nhập:

- **Username**: `admin`
- **Password**: `admin`

## 📁 Cấu trúc thư mục

```
finance-academy/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth
│   │   ├── income/            # Income API
│   │   ├── expenses/          # Expenses API
│   │   ├── analytics/         # Analytics API
│   │   ├── export/            # Export API
│   │   └── upload/            # File upload API
│   ├── dashboard/             # Dashboard pages
│   │   ├── income/            # Income management
│   │   ├── expenses/          # Expense management
│   │   └── profit-loss/       # Profit/Loss analysis
│   └── login/                 # Login page
├── components/
│   └── modals/                # Modal components
├── lib/                       # Utility libraries
│   ├── prisma.ts             # Prisma client
│   ├── s3.ts                 # AWS S3 utilities
│   ├── utils.ts              # Helper functions
│   └── export.ts             # Excel export
├── prisma/
│   └── schema.prisma         # Database schema
├── scripts/
│   └── import-data.ts        # Data import script
└── public/                    # Static files
```

## 🔐 AWS S3 Setup

1. Tạo S3 bucket trên AWS Console
2. Cấu hình CORS cho bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

3. Tạo IAM user với quyền S3 và lấy Access Key
4. Cập nhật credentials vào file `.env`

## 📊 Sử dụng

### Quản lý thu nhập

1. Vào menu "Thu nhập"
2. Nhấn "Thêm mới" để tạo bản ghi thu nhập
3. Điền thông tin: tháng, năm, trung tâm, chương trình, số lớp, học viên, doanh thu
4. Có thể tải file đính kèm lên S3
5. Xuất dữ liệu ra Excel

### Quản lý chi phí

1. Vào menu "Chi phí"
2. Nhấn "Thêm mới" để tạo bản ghi chi phí
3. Điền đầy đủ thông tin chi phí
4. Xuất báo cáo chi phí

### Phân tích lợi nhuận

1. Vào menu "Lợi nhuận/Lỗ"
2. Chọn năm và trung tâm để lọc
3. Xem biểu đồ và bảng chi tiết
4. Xuất báo cáo tổng hợp

## 🚀 Production Deployment

### Build ứng dụng

```bash
npm run build
npm start
```

### Lưu ý khi deploy

1. Đổi `NEXTAUTH_SECRET` thành giá trị bảo mật
2. Cập nhật `NEXTAUTH_URL` thành domain thực tế
3. Sử dụng PostgreSQL production database
4. Cấu hình SSL cho database connection
5. Thiết lập backup cho database và S3

## 📝 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm start` - Chạy production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Mở Prisma Studio
- `npm run import-data` - Import dữ liệu từ Excel

## 🤝 Hỗ trợ

Nếu gặp vấn đề, vui lòng kiểm tra:

1. PostgreSQL đã chạy chưa
2. File `.env` đã cấu hình đúng chưa
3. AWS credentials có quyền truy cập S3 không
4. Database đã được migrate chưa

## 📄 License

MIT License
