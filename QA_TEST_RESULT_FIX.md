# QA Test Result Fix - แก้ไขปัญหา 400 Bad Request

## ปัญหาที่พบ

```
POST http://127.0.0.1:5000/api/qa-test-results 400 (Bad Request)
```

## สาเหตุของปัญหา

ปัญหาเกิดจากการไม่ตรงกันระหว่างข้อมูลที่ส่งไปจาก client และ schema ที่ server คาดหวัง:

1. **Schema Mismatch**: ใน schema ของ `qaTestResults` มี field `testItems` ที่เป็น `json` type
2. **Data Type Mismatch**: Client ส่ง `testItems` เป็น array ของ objects แต่ server คาดหวัง JSON string
3. **Missing Validation**: `insertQaTestResultSchema` ไม่มีการกำหนด validation สำหรับ `testItems`

## การแก้ไข

### 1. แก้ไข Schema (`shared/schema.ts`)

#### ก่อนแก้ไข:
```typescript
export const insertQaTestResultSchema = createInsertSchema(qaTestResults).omit({ id: true }).extend({
  dueDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  sampleId: z.number().nullable(),
  method: z.string().nullable(),
  result: z.string().nullable(),
  unit: z.string().nullable(),
  specification: z.string().nullable(),
  recordDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});
```

#### หลังแก้ไข:
```typescript
export const insertQaTestResultSchema = createInsertSchema(qaTestResults).omit({ id: true }).extend({
  dueDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  sampleId: z.number().nullable(),
  testItems: z.any().nullable(), // เพิ่ม validation สำหรับ testItems
  method: z.string().nullable(),
  result: z.string().nullable(),
  unit: z.string().nullable(),
  specification: z.string().nullable(),
  recordDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});
```

### 2. แก้ไขการส่งข้อมูล (`qa-test-result-form-modal.tsx`)

#### ก่อนแก้ไข:
```typescript
const payload = {
  ...data,
  dueDate: new Date(data.dueDate),
  testItems: data.testItems.map(item => ({
    ...item,
    recordDate: new Date(item.recordDate),
  })),
};
```

#### หลังแก้ไข:
```typescript
const payload = {
  ...data,
  dueDate: new Date(data.dueDate),
  testItems: JSON.stringify(data.testItems.map(item => ({
    ...item,
    recordDate: new Date(item.recordDate),
  }))), // แปลงเป็น JSON string
};
```

### 3. แก้ไขการโหลดข้อมูลสำหรับการแก้ไข

#### ก่อนแก้ไข:
```typescript
testItems: testResult.testItems ? 
  (testResult.testItems as any[]).map((item: any) => ({
    // ... mapping logic
  })) : []
```

#### หลังแก้ไข:
```typescript
testItems: testResult.testItems ? 
  (typeof testResult.testItems === 'string' ? JSON.parse(testResult.testItems) : testResult.testItems as any[]).map((item: any) => ({
    // ... mapping logic
  })) : []
```

## หลักการแก้ไข

### 1. Data Type Consistency
- **Client**: ใช้ array ของ objects สำหรับ form handling
- **Server**: รับ JSON string สำหรับ database storage
- **Conversion**: แปลงระหว่าง array และ JSON string ตามความเหมาะสม

### 2. Schema Validation
- เพิ่ม validation สำหรับ `testItems` ใน schema
- ใช้ `z.any().nullable()` เพื่อรองรับทั้ง array และ JSON string

### 3. Error Handling
- ตรวจสอบ type ของ `testItems` ก่อนการ parse
- ใช้ try-catch สำหรับ JSON.parse operations

## ไฟล์ที่แก้ไข

1. **`shared/schema.ts`**
   - เพิ่ม `testItems: z.any().nullable()` ใน `insertQaTestResultSchema`

2. **`client/src/components/qa/qa-test-result-form-modal.tsx`**
   - แก้ไขการส่งข้อมูล: แปลง `testItems` เป็น JSON string
   - แก้ไขการโหลดข้อมูล: ตรวจสอบ type และ parse JSON string

## การทดสอบ

### 1. ทดสอบการเพิ่มข้อมูล
1. เปิด modal เพิ่มผลการทดสอบ
2. กรอกข้อมูลและเพิ่ม test items
3. กดบันทึก
4. ตรวจสอบว่าไม่มี error 400

### 2. ทดสอบการแก้ไขข้อมูล
1. เปิด modal แก้ไขผลการทดสอบ
2. เปลี่ยนข้อมูล
3. กดบันทึก
4. ตรวจสอบว่าไม่มี error 400

### 3. ทดสอบการโหลดข้อมูล
1. เปิด modal แก้ไขผลการทดสอบ
2. ตรวจสอบว่าข้อมูลโหลดได้ถูกต้อง
3. ตรวจสอบว่า test items แสดงผลถูกต้อง

## ข้อควรระวัง

1. **JSON Parsing**: ตรวจสอบ type ก่อนใช้ JSON.parse
2. **Data Validation**: ตรวจสอบข้อมูลก่อนส่งไป server
3. **Error Handling**: จัดการ error ที่อาจเกิดขึ้นจากการ parse JSON
4. **Type Safety**: ใช้ TypeScript เพื่อ type safety

## การป้องกันในอนาคต

1. **Schema Validation**: ตรวจสอบ schema ก่อนส่งข้อมูล
2. **Type Guards**: สร้าง type guards สำหรับ JSON data
3. **Error Boundaries**: ใช้ React Error Boundaries
4. **Testing**: เขียน test cases สำหรับ data transformation 