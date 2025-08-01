# Data Persistence Feature

## ภาพรวม

ระบบ Data Persistence ถูกออกแบบมาเพื่อป้องกันข้อมูลหายเมื่อรีเฟรชหน้าเว็บ โดยใช้ localStorage และ React Query cache เพื่อเก็บข้อมูลไว้ในเบราว์เซอร์

## คุณสมบัติหลัก

### 1. Client-side Storage
- ใช้ localStorage เพื่อเก็บข้อมูลในเบราว์เซอร์
- มีระบบ TTL (Time To Live) เพื่อลบข้อมูลเก่า
- รองรับการเก็บข้อมูลหลายประเภท

### 2. React Query Integration
- ใช้ React Query cache ร่วมกับ localStorage
- มีการ sync ข้อมูลระหว่าง cache และ localStorage
- รองรับการ invalidate cache เมื่อมีการเปลี่ยนแปลง

### 3. Custom Hooks
- `usePersistentData` - Hook หลักสำหรับจัดการ data persistence
- Hooks เฉพาะสำหรับแต่ละประเภทข้อมูล (useQaSamples, useChemicals, etc.)

## การใช้งาน

### 1. ใช้ Custom Hook

```typescript
import { useQaSamples } from '@/hooks/use-persistent-data';

function MyComponent() {
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    removeFromCache,
    addToCache,
    updateInCache 
  } = useQaSamples();

  // ข้อมูลจะถูกโหลดจาก cache ก่อน แล้วค่อย fetch จาก server
  // หาก server ไม่ตอบสนอง จะใช้ข้อมูลจาก cache
}
```

### 2. ใช้ Storage Utility โดยตรง

```typescript
import { QaSampleStorage } from '@/lib/storage';

// บันทึกข้อมูล
QaSampleStorage.save(data);

// โหลดข้อมูล
const data = QaSampleStorage.load();

// ลบข้อมูล
QaSampleStorage.clear();
```

### 3. ใช้ ClientStorage Class

```typescript
import { ClientStorage } from '@/lib/storage';

// บันทึกข้อมูลพร้อม TTL
ClientStorage.setItem('my-key', data, 5 * 60 * 1000); // 5 นาที

// โหลดข้อมูล
const data = ClientStorage.getItem('my-key');

// ลบข้อมูล
ClientStorage.removeItem('my-key');

// ลบ cache ทั้งหมด
ClientStorage.clearCache();
```

## การตั้งค่า

### TTL (Time To Live)
- ค่าเริ่มต้น: 5 นาที
- สามารถปรับได้ตามความต้องการ
- ข้อมูลจะถูกลบอัตโนมัติเมื่อหมดอายุ

### Cache Keys
```typescript
export const STORAGE_KEYS = {
  QA_SAMPLES: 'qa-samples-cache',
  CHEMICALS: 'chemicals-cache',
  TOOLS: 'tools-cache',
  // ... อื่นๆ
};
```

## การจัดการ Error

### 1. Network Error
- ระบบจะใช้ข้อมูลจาก cache หาก server ไม่ตอบสนอง
- แสดง toast notification แจ้งเตือนผู้ใช้

### 2. Cache Error
- ระบบจะพยายาม fetch ข้อมูลใหม่
- แสดง error message หากไม่สามารถโหลดข้อมูลได้

## การ Optimize

### 1. Memory Management
- ข้อมูลจะถูกลบอัตโนมัติเมื่อหมดอายุ
- มีการจัดการ memory usage

### 2. Performance
- ใช้ React Query cache เพื่อลดการ fetch ข้อมูล
- มีการ debounce การ save ข้อมูล

## การ Debug

### 1. ดู Cache Stats
```typescript
import { ClientStorage } from '@/lib/storage';

const stats = ClientStorage.getCacheStats();
console.log('Cache items:', stats.totalItems);
console.log('Cache size:', stats.totalSize);
```

### 2. Clear Cache
```typescript
ClientStorage.clearCache();
```

## การทดสอบ

### 1. ทดสอบ Data Persistence
1. เพิ่มข้อมูลใหม่
2. รีเฟรชหน้าเว็บ
3. ตรวจสอบว่าข้อมูลยังคงอยู่

### 2. ทดสอบ Error Handling
1. ปิด server
2. รีเฟรชหน้าเว็บ
3. ตรวจสอบว่าข้อมูลจาก cache ยังแสดงอยู่

### 3. ทดสอบ TTL
1. รอให้ข้อมูลหมดอายุ
2. ตรวจสอบว่าข้อมูลถูกลบอัตโนมัติ

## ข้อควรระวัง

1. **Storage Limit**: localStorage มีขนาดจำกัด (ประมาณ 5-10MB)
2. **Data Security**: ข้อมูลใน localStorage ไม่ปลอดภัย 100%
3. **Browser Compatibility**: ตรวจสอบ browser support
4. **Data Consistency**: ข้อมูลใน cache อาจไม่ตรงกับ server

## การพัฒนาต่อ

1. **IndexedDB**: ใช้ IndexedDB แทน localStorage สำหรับข้อมูลขนาดใหญ่
2. **Service Worker**: เพิ่ม offline support
3. **Data Sync**: เพิ่มระบบ sync ข้อมูลระหว่าง devices
4. **Compression**: เพิ่มการบีบอัดข้อมูลเพื่อประหยัดพื้นที่ 