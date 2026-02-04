# 🛒 E-Commerce Dashboard with Supabase

E-commerce Web Application พร้อม Authentication, Dashboard และ Database

## ✨ ฟีเจอร์

- ✅ **Authentication** (Login/Register) ด้วย Supabase
- ✅ **Dashboard** พร้อม Sidebar แบบ Collapsible
- ✅ **Role-based Access** (Admin & Customer)
- ✅ **Supabase Database** (6 ตาราง + RLS)
- ✅ **Responsive Design** ด้วย Tailwind CSS
- ✅ **TypeScript** Support

## 🚀 การติดตั้ง

### 1. Setup Supabase

1. สร้าง account ที่ [supabase.com](https://supabase.com)
2. สร้าง project ใหม่
3. ไปที่ **SQL Editor**
4. คัดลอกโค้ดจาก `supabase-schema.sql` และรัน
5. ไปที่ **Settings > API** จดบันทึก:
   - Project URL
   - anon/public key

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment

คัดลอก `.env.example` เป็น `.env`:

```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:

```env
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=your-anon-key-here
```

### 4. เริ่มใช้งาน

```bash
npm run dev
```

เปิดเบราว์เซอร์: `http://localhost:3000`

## 📁 โครงสร้างโปรเจค

```
ecommerce-dashboard/
├── assets/
│   └── css/
│       └── main.css              # Tailwind CSS
├── components/
│   └── Sidebar.vue               # Sidebar component
├── composables/
│   └── useAuth.ts                # Authentication logic
├── middleware/
│   ├── auth.ts                   # Protected routes
│   ├── guest.ts                  # Guest only routes
│   └── admin.ts                  # Admin only routes
├── pages/
│   ├── login.vue                 # Login page
│   ├── register.vue              # Register page
│   └── dashboard/
│       └── index.vue             # Dashboard
├── plugins/
│   └── supabase.client.ts        # Supabase client
├── .env.example                  # Environment template
├── nuxt.config.ts                # Nuxt configuration
├── package.json                  # Dependencies
├── supabase-schema.sql           # Database schema
├── tailwind.config.js            # Tailwind config
└── README.md                     # This file
```

## 🎯 การใช้งาน

### สมัครสมาชิก
1. ไปที่ `/register`
2. กรอกข้อมูล (ชื่อ, อีเมล, รหัสผ่าน)
3. กดสมัครสมาชิก

### เข้าสู่ระบบ
1. ไปที่ `/login`
2. กรอก Email และ Password
3. เข้าสู่ระบบ

### Dashboard
- ดู Stats Cards (ยอดขาย, คำสั่งซื้อ, ลูกค้า)
- ใช้ Quick Actions
- ดูคำสั่งซื้อล่าสุด
- เมนู Sidebar: หน้าแรก, สินค้า, คำสั่งซื้อ, ลูกค้า, รายงาน, ตั้งค่า

## 🔐 สิทธิ์การใช้งาน

### Customer (ค่าเริ่มต้น)
- ดูสินค้า
- สั่งซื้อสินค้า
- ดูประวัติคำสั่งซื้อของตัวเอง

### Admin
เปลี่ยน role เป็น admin ใน Supabase SQL Editor:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

Admin สามารถ:
- จัดการสินค้า
- ดูคำสั่งซื้อทั้งหมด
- จัดการลูกค้า
- ดูรายงาน

## 📊 Database Schema

### Tables:
- **profiles** - ข้อมูลผู้ใช้
- **categories** - หมวดหมู่สินค้า
- **products** - สินค้า
- **orders** - คำสั่งซื้อ
- **order_items** - รายการสินค้าในคำสั่งซื้อ
- **cart** - ตะกร้าสินค้า

### Row Level Security (RLS)
- ผู้ใช้เห็นเฉพาะข้อมูลของตัวเอง
- Admin เห็นข้อมูลทั้งหมด
- สินค้า: ทุกคนดูได้ แต่แก้ไขได้เฉพาะ Admin

## 🐛 Troubleshooting

### ไม่สามารถเข้าสู่ระบบได้
1. ตรวจสอบ `.env` ว่าใส่ URL และ Key ถูกต้อง
2. เช็ค Console เบราว์เซอร์หา error
3. ตรวจสอบ Supabase Authentication settings

### Database Error
1. รัน `supabase-schema.sql` ใหม่
2. เช็ค RLS Policies
3. ดู Logs ใน Supabase Dashboard

### Sidebar ไม่แสดง
1. ตรวจสอบว่า Tailwind ติดตั้งแล้ว
2. เช็ค Browser Console
3. ลอง Hard Refresh (Ctrl+Shift+R)

## 🛠️ การพัฒนาต่อ

### ฟีเจอร์ที่แนะนำให้เพิ่ม:

1. **Product Management**
   - CRUD สินค้า
   - อัพโหลดรูปภาพ
   - จัดการสต๊อก

2. **Order Management**
   - ดูรายละเอียดคำสั่งซื้อ
   - อัพเดทสถานะ
   - พิมพ์ใบเสร็จ

3. **Shopping Cart**
   - เพิ่ม/ลด/ลบสินค้า
   - คำนวณราคา
   - Checkout

4. **Reports & Analytics**
   - รายงานยอดขาย
   - กราฟแสดงสถิติ
   - Export ข้อมูล

## 📚 เอกสารอ้างอิง

- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vue 3 Docs](https://vuejs.org/)

## 📝 Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run generate   # Generate static site
npm run preview    # Preview production build
```

