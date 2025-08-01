# React Key Fix - แก้ไขปัญหา Key ซ้ำกัน

## ปัญหาที่พบ

```
Warning: Encountered two children with the same key, `sd2`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.
```

## สาเหตุของปัญหา

ปัญหาเกิดจากการใช้ key ที่ซ้ำกันใน React components โดยเฉพาะเมื่อ:

1. **ใช้ `field.id` จาก `useFieldArray`** - field.id อาจซ้ำกันเมื่อมีการ reset form
2. **ใช้ `index` อย่างเดียว** - index อาจซ้ำกันเมื่อมีการ re-render
3. **ใช้ `value` อย่างเดียว** - value อาจซ้ำกันหากมีข้อมูลที่เหมือนกัน

## การแก้ไข

### 1. แก้ไขใน `qa-test-result-form-modal.tsx`

#### ก่อนแก้ไข:
```tsx
{fields.map((field, index) => (
  <div key={field.id} className="border rounded-lg p-4 space-y-4">
    {/* content */}
  </div>
))}
```

#### หลังแก้ไข:
```tsx
{fields.map((field, index) => (
  <div key={`test-item-${index}-${field.id}`} className="border rounded-lg p-4 space-y-4">
    {/* content */}
  </div>
))}
```

### 2. แก้ไขใน `qa-sample-form-modal.tsx`

#### ก่อนแก้ไข:
```tsx
{fields.map((field, index) => (
  <div key={field.id} className="p-6 bg-white rounded-xl">
    {/* content */}
  </div>
))}
```

#### หลังแก้ไข:
```tsx
{fields.map((field, index) => (
  <div key={`sample-${index}-${field.id}`} className="p-6 bg-white rounded-xl">
    {/* content */}
  </div>
))}
```

### 3. แก้ไขการใช้ key ใน SelectItem

#### ก่อนแก้ไข:
```tsx
{options.map((option) => (
  <SelectItem key={option.value} value={option.value}>
    {option.label}
  </SelectItem>
))}
```

#### หลังแก้ไข:
```tsx
{options.map((option, optionIndex) => (
  <SelectItem key={`option-${optionIndex}-${option.value}`} value={option.value}>
    {option.label}
  </SelectItem>
))}
```

## หลักการแก้ไข

### 1. ใช้ Composite Key
- รวม index กับ field.id หรือ value
- ตัวอย่าง: `key={`item-${index}-${field.id}`}`

### 2. ใช้ Prefix ที่เฉพาะเจาะจง
- เพิ่ม prefix เพื่อแยกประเภท
- ตัวอย่าง: `key={`test-item-${index}`}`, `key={`sample-${index}`}`

### 3. หลีกเลี่ยงการใช้ index อย่างเดียว
- index อาจซ้ำกันเมื่อมีการ re-render
- ควรใช้ร่วมกับข้อมูลอื่นๆ

## ไฟล์ที่แก้ไข

1. **`client/src/components/qa/qa-test-result-form-modal.tsx`**
   - แก้ไข key ใน fields.map
   - แก้ไข key ใน availableSampleNos.map
   - แก้ไข key ใน testTypeOptions.map
   - แก้ไข key ใน selectedSampleNames.map

2. **`client/src/components/qa/qa-sample-form-modal.tsx`**
   - แก้ไข key ใน fields.map
   - แก้ไข key ใน names.map
   - แก้ไข key ใน itemTests.map
   - แก้ไข key ใน options.map ทั้งหมด

## การทดสอบ

### 1. ทดสอบการเพิ่มข้อมูล
1. เปิด modal เพิ่มข้อมูล
2. เพิ่ม/ลบ items หลายครั้ง
3. ตรวจสอบว่าไม่มี warning เกี่ยวกับ key

### 2. ทดสอบการแก้ไขข้อมูล
1. เปิด modal แก้ไขข้อมูล
2. เปลี่ยนข้อมูลหลายครั้ง
3. ตรวจสอบว่าไม่มี warning เกี่ยวกับ key

### 3. ทดสอบการรีเฟรชหน้า
1. รีเฟรชหน้าเว็บ
2. ตรวจสอบว่าไม่มี warning เกี่ยวกับ key

## ข้อควรระวัง

1. **ไม่ใช้ index อย่างเดียว** - อาจซ้ำกันเมื่อ re-render
2. **ไม่ใช้ value อย่างเดียว** - อาจซ้ำกันหากมีข้อมูลเหมือนกัน
3. **ไม่ใช้ field.id อย่างเดียว** - อาจซ้ำกันเมื่อ reset form
4. **ใช้ composite key** - รวมหลายค่าด้วยกันเพื่อให้ unique

## การป้องกันในอนาคต

1. **สร้าง utility function** สำหรับสร้าง unique key
2. **ใช้ ESLint rule** เพื่อตรวจสอบ key ที่อาจซ้ำกัน
3. **เขียน test** เพื่อตรวจสอบ key uniqueness
4. **ใช้ TypeScript** เพื่อ type safety

## ตัวอย่าง Utility Function

```typescript
// utils/keyGenerator.ts
export const generateKey = (prefix: string, index: number, id?: string | number) => {
  return `${prefix}-${index}${id ? `-${id}` : ''}`;
};

// การใช้งาน
const key = generateKey('test-item', index, field.id);
// ผลลัพธ์: "test-item-0-sd2"
``` 