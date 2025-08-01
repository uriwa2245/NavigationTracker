# QA Test Result 400 Bad Request Fix

## ปัญหาที่พบ

```
POST http://127.0.0.1:5000/api/qa-test-results 400 (Bad Request)
```

## สาเหตุของปัญหา

ปัญหาเกิดจากการไม่ตรงกันระหว่าง schema validation และข้อมูลที่ส่งไป:

1. **Missing Required Field Validation**: ใน `insertQaTestResultSchema` ไม่มีการกำหนด validation สำหรับ field ที่จำเป็น (`sampleNo`, `requestNo`, `product`)
2. **Schema Mismatch**: `createInsertSchema` สร้าง schema ที่ไม่รวม validation สำหรับ required fields
3. **Data Type Issues**: การแปลงข้อมูลระหว่าง client และ server

## การแก้ไข

### 1. แก้ไข Schema (`shared/schema.ts`)

#### ก่อนแก้ไข:
```typescript
export const insertQaTestResultSchema = createInsertSchema(qaTestResults).omit({ id: true }).extend({
  dueDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  sampleId: z.number().nullable(),
  testItems: z.any().nullable(),
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
  sampleNo: z.string().min(1, "Sample No is required"),
  requestNo: z.string().min(1, "Request No is required"),
  product: z.string().min(1, "Product is required"),
  dueDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  sampleId: z.number().nullable(),
  testItems: z.any().nullable(),
  method: z.string().nullable(),
  result: z.string().nullable(),
  unit: z.string().nullable(),
  specification: z.string().nullable(),
  recordDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});
```

### 2. เพิ่ม Logging สำหรับ Debug

#### Server-side (`server/routes.ts`):
```typescript
app.post("/api/qa-test-results", async (req, res) => {
  try {
    console.log("Received payload:", JSON.stringify(req.body, null, 2));
    const result = insertQaTestResultSchema.safeParse(req.body);
    if (!result.success) {
      console.log("Validation errors:", JSON.stringify(result.error.issues, null, 2));
      return res.status(400).json({ message: "Invalid QA test result data", errors: result.error.issues });
    }
    const testResult = await storage.createQaTestResult(result.data);
    res.status(201).json(testResult);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Failed to create QA test result" });
  }
});
```

#### Client-side (`qa-test-result-form-modal.tsx`):
```typescript
const mutation = useMutation({
  mutationFn: async (data: QaTestResultFormData) => {
    const payload = {
      ...data,
      dueDate: new Date(data.dueDate),
      testItems: JSON.stringify(data.testItems.map(item => ({
        ...item,
        recordDate: new Date(item.recordDate),
      }))),
    };

    console.log("Sending payload:", JSON.stringify(payload, null, 2));

    if (isEditing && testResult) {
      await apiRequest("PUT", `/api/qa-test-results/${testResult.id}`, payload);
    } else {
      await apiRequest("POST", "/api/qa-test-results", payload);
    }
  },
  // ... rest of mutation config
});
```

## หลักการแก้ไข

### 1. Required Field Validation
- เพิ่ม validation สำหรับ field ที่จำเป็น (`sampleNo`, `requestNo`, `product`)
- ใช้ `z.string().min(1, "error message")` เพื่อตรวจสอบว่าไม่เป็น empty string

### 2. Schema Consistency
- ตรวจสอบว่า schema ตรงกับ database schema
- ใช้ `createInsertSchema` เป็นพื้นฐานและ extend ด้วย custom validation

### 3. Debug Logging
- เพิ่ม logging ทั้ง client และ server เพื่อดู payload และ validation errors
- ช่วยในการ debug ปัญหาที่เกิดขึ้น

## ไฟล์ที่แก้ไข

1. **`shared/schema.ts`**
   - เพิ่ม validation สำหรับ required fields ใน `insertQaTestResultSchema`

2. **`server/routes.ts`**
   - เพิ่ม console logging เพื่อดู payload และ validation errors

3. **`client/src/components/qa/qa-test-result-form-modal.tsx`**
   - เพิ่ม console logging เพื่อดู payload ที่ส่งไป

## การทดสอบ

### 1. ทดสอบการเพิ่มข้อมูล
1. เปิด modal เพิ่มผลการทดสอบ
2. กรอกข้อมูลครบถ้วน (Sample No, Request No, Product)
3. เพิ่ม test items
4. กดบันทึก
5. ตรวจสอบ console logs ทั้ง client และ server
6. ตรวจสอบว่าไม่มี error 400

### 2. ทดสอบการแก้ไขข้อมูล
1. เปิด modal แก้ไขผลการทดสอบ
2. เปลี่ยนข้อมูล
3. กดบันทึก
4. ตรวจสอบ console logs
5. ตรวจสอบว่าไม่มี error 400

### 3. ทดสอบ Validation Errors
1. ลองส่งข้อมูลที่ไม่ครบถ้วน
2. ตรวจสอบ validation error messages
3. ตรวจสอบ console logs เพื่อดู error details

## ข้อควรระวัง

1. **Required Fields**: ตรวจสอบว่า field ที่จำเป็นถูกส่งไปครบถ้วน
2. **Data Types**: ตรวจสอบว่า data types ตรงกับ schema
3. **JSON Serialization**: ตรวจสอบการแปลง `testItems` เป็น JSON string
4. **Error Handling**: จัดการ error ที่อาจเกิดขึ้นจากการ validation

## การป้องกันในอนาคต

1. **Schema Validation**: ตรวจสอบ schema ก่อนส่งข้อมูล
2. **Type Safety**: ใช้ TypeScript เพื่อ type safety
3. **Error Boundaries**: ใช้ React Error Boundaries
4. **Testing**: เขียน test cases สำหรับ validation 