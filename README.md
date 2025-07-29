# Navigation Tracker - Laboratory Management System

ระบบจัดการห้องปฏิบัติการที่ครอบคลุมการจัดการเครื่องมือ อุปกรณ์ สารเคมี และกระบวนการ QA

## ฟีเจอร์หลัก

### 1. การจัดการเครื่องมือ (Tools)
- ระบบติดตามการสอบเทียบเครื่องมือ
- ประวัติการสอบเทียบ
- การแจ้งเตือนการสอบเทียบที่ใกล้ครบกำหนด

### 2. การจัดการอุปกรณ์ (Glassware)
- ระบบติดตามการสอบเทียบอุปกรณ์แก้ว
- ประวัติการสอบเทียบ
- การจัดการตำแหน่งที่เก็บ

### 3. การจัดการสารเคมี (Chemicals)
- ระบบติดตามวันหมดอายุ
- การแจ้งเตือนสารเคมีที่ใกล้หมดอายุ
- การจัดการตามหมวดหมู่

### 4. ระบบ QA (Quality Assurance)

#### 4.1 การรับตัวอย่าง (QA Sample Receiving)
- **ฟีเจอร์ใหม่**: สามารถเพิ่มชื่อตัวอย่างได้หลายชื่อในแต่ละ Sample No
- ระบบจัดการข้อมูลผู้ใช้บริการ
- การกำหนดรายการทดสอบ (Item Tests)
- **ฟีเจอร์ใหม่**: รองรับ Active Ingredient ที่แยกตามชื่อตัวอย่าง

#### 4.2 การลงผลการทดสอบ (QA Test Results)
- **ฟีเจอร์ใหม่**: ดึงข้อมูลจากระบบรับตัวอย่างอัตโนมัติ
- **ฟีเจอร์ใหม่**: แยก Active Ingredient ตามชื่อตัวอย่าง
- ระบบคำนวณค่าเฉลี่ยอัตโนมัติ
- การจัดการผลการทดสอบแบบละเอียด

### 5. ระบบอื่นๆ
- การจัดการเอกสาร (Documents)
- การจัดการการฝึกอบรม (Training)
- การจัดการ MSDS
- การจัดการงาน (Tasks)

## การใช้งานฟีเจอร์ใหม่

### การรับตัวอย่างหลายชื่อ
1. ไปที่หน้า "รับตัวอย่าง"
2. คลิก "เพิ่มตัวอย่าง"
3. กรอกข้อมูลพื้นฐาน
4. ในส่วน "รายละเอียดตัวอย่าง":
   - กรอก Sample No
   - กรอกชื่อตัวอย่าง
   - เพิ่มรายการทดสอบ
   - **สำหรับ Active Ingredient**: กรอกชื่อตัวอย่างเฉพาะในฟิลด์ "ชื่อตัวอย่าง"

### การลงผลการทดสอบ
1. ไปที่หน้า "ผลการทดสอบ"
2. คลิก "เพิ่มผลการทดสอบ"
3. เลือก Sample No จาก dropdown
4. ระบบจะแสดงข้อมูลอัตโนมัติ:
   - Request No
   - Product (ชื่อตัวอย่าง)
   - Due Date
   - ข้อมูลบริษัทและผู้ติดต่อ
5. **สำหรับ Active Ingredient**: ระบบจะแยกการทดสอบตามชื่อตัวอย่างที่กำหนดไว้

## การติดตั้ง

```bash
npm install
npm run dev
```

## เทคโนโลยีที่ใช้

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query
- **Form Management**: React Hook Form + Zod

## โครงสร้างโปรเจค

```
NavigationTracker/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   └── pages/         # Page components
├── server/                # Backend Express app
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage
├── shared/                # Shared schemas
└── package.json
```

## การพัฒนา

### การเพิ่มฟีเจอร์ใหม่
1. อัปเดต schema ใน `shared/schema.ts`
2. เพิ่ม API routes ใน `server/routes.ts`
3. อัปเดต storage ใน `server/storage.ts`
4. สร้าง components ใน `client/src/components/`
5. อัปเดต pages ใน `client/src/pages/`

### การทดสอบ
```bash
npm run test
```

## การ Deploy

### Vercel
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t navigation-tracker .
docker run -p 3000:3000 navigation-tracker
```

## การสนับสนุน

สำหรับคำถามหรือปัญหาการใช้งาน กรุณาติดต่อทีมพัฒนา 