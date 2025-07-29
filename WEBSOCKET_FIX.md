# การแก้ไขปัญหา WebSocket Connection

## ปัญหาที่พบ
```
WebSocket connection to 'ws://127.0.0.1:5000/?token=_7Pr1eGbwyeV' failed: 
Uncaught (in promise) SyntaxError: Failed to construct 'WebSocket': The URL 'ws://localhost:undefined/?token=_7Pr1eGbwyeV' is invalid.
```

## สาเหตุของปัญหา
ปัญหานี้เกิดจาก Vite HMR (Hot Module Replacement) ที่พยายามเชื่อมต่อ WebSocket แต่ไม่สามารถหา port ที่ถูกต้องได้ เนื่องจาก:
1. การตั้งค่า HMR port ไม่ถูกต้อง
2. Environment variables ไม่ถูกกำหนด
3. การจัดการ WebSocket connection ไม่เหมาะสม

## การแก้ไขที่ทำ

### 1. แก้ไขการตั้งค่า Vite HMR
- กำหนด port และ host ที่ชัดเจน
- เพิ่มการจัดการ environment variables
- เพิ่มตัวเลือกในการปิด HMR

### 2. ปรับปรุง server/vite.ts
- เพิ่มการตั้งค่า HMR ที่เหมาะสม
- จัดการ WebSocket connection อย่างถูกต้อง

### 3. สร้าง WebSocket utility
- เพิ่มไฟล์ `client/src/lib/websocket.ts`
- จัดการ connection, reconnection, และ error handling
- เพิ่ม fallback mechanism

### 4. เพิ่ม scripts ใหม่
- `npm run dev:no-hmr` - รันโดยไม่ใช้ HMR

## วิธีการใช้งาน

### วิธีที่ 1: ใช้การตั้งค่าเริ่มต้น
```bash
npm run dev
```

### วิธีที่ 2: ปิด HMR (หากยังมีปัญหา)
```bash
npm run dev:no-hmr
```

### วิธีที่ 3: กำหนดค่า environment variables
สร้างไฟล์ `.env` และกำหนดค่า:
```env
VITE_HMR_PORT=24678
VITE_HMR_HOST=localhost
# หรือปิด HMR
DISABLE_HMR=true
```

## การตั้งค่า Environment Variables

### VITE_HMR_PORT
- Port สำหรับ WebSocket connection
- ค่าเริ่มต้น: 24678

### VITE_HMR_HOST
- Host สำหรับ WebSocket connection
- ค่าเริ่มต้น: localhost

### DISABLE_HMR
- ปิด HMR หากมีปัญหา
- ค่า: true/false

## การตรวจสอบการทำงาน

1. เปิด Developer Tools (F12)
2. ไปที่ Console tab
3. ตรวจสอบข้อความ:
   - "WebSocket connected successfully" - เชื่อมต่อสำเร็จ
   - "WebSocket connection error" - มีปัญหา
   - "WebSocket not available, using polling fallback" - ใช้ fallback

## การแก้ไขปัญหาเพิ่มเติม

### หากยังมีปัญหา WebSocket:
1. ใช้ `npm run dev:no-hmr`
2. ตรวจสอบ firewall settings
3. ตรวจสอบ antivirus software
4. ลองใช้ browser อื่น

### หากต้องการ HMR แต่มีปัญหา:
1. กำหนด `VITE_HMR_PORT` เป็น port อื่น
2. ตรวจสอบ port availability
3. ใช้ `VITE_HMR_HOST=0.0.0.0` สำหรับ network access

## หมายเหตุ
- HMR ช่วยให้ development เร็วขึ้นโดยไม่ต้อง refresh หน้า
- หากปิด HMR จะต้อง refresh หน้าเมื่อแก้ไขโค้ด
- การตั้งค่าเหล่านี้มีผลเฉพาะใน development mode เท่านั้น 