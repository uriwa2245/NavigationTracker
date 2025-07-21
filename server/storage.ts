import {
  Tool, InsertTool,
  ToolCalibrationHistory, InsertToolCalibrationHistory,
  Glassware, InsertGlassware,
  GlasswareCalibrationHistory, InsertGlasswareCalibrationHistory,
  Chemical, InsertChemical,
  Document, InsertDocument,
  Training, InsertTraining,
  Msds, InsertMsds,
  Task, InsertTask,
  QaSample, InsertQaSample,
  QaTestResult, InsertQaTestResult
} from "@shared/schema";

export interface IStorage {
  // Tools
  getTools(): Promise<Tool[]>;
  getTool(id: number): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool | undefined>;
  deleteTool(id: number): Promise<boolean>;

  // Tool Calibration History
  getToolCalibrationHistory(toolId: number): Promise<ToolCalibrationHistory[]>;
  createToolCalibrationHistory(history: InsertToolCalibrationHistory): Promise<ToolCalibrationHistory>;

  // Glassware
  getGlassware(): Promise<Glassware[]>;
  getGlasswareItem(id: number): Promise<Glassware | undefined>;
  createGlassware(glassware: InsertGlassware): Promise<Glassware>;
  updateGlassware(id: number, glassware: Partial<InsertGlassware>): Promise<Glassware | undefined>;
  deleteGlassware(id: number): Promise<boolean>;

  // Glassware Calibration History
  getGlasswareCalibrationHistory(glasswareId: number): Promise<GlasswareCalibrationHistory[]>;
  createGlasswareCalibrationHistory(history: InsertGlasswareCalibrationHistory): Promise<GlasswareCalibrationHistory>;

  // Chemicals
  getChemicals(): Promise<Chemical[]>;
  getChemicalsByCategory(category: string): Promise<Chemical[]>;
  getChemical(id: number): Promise<Chemical | undefined>;
  createChemical(chemical: InsertChemical): Promise<Chemical>;
  updateChemical(id: number, chemical: Partial<InsertChemical>): Promise<Chemical | undefined>;
  deleteChemical(id: number): Promise<boolean>;

  // Documents
  getDocuments(): Promise<Document[]>;
  getDocumentsByCategory(category: string): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // Training
  getTraining(): Promise<Training[]>;
  getTrainingItem(id: number): Promise<Training | undefined>;
  createTraining(training: InsertTraining): Promise<Training>;
  updateTraining(id: number, training: Partial<InsertTraining>): Promise<Training | undefined>;
  deleteTraining(id: number): Promise<boolean>;

  // MSDS
  getMsds(): Promise<Msds[]>;
  getMsdsByCategory(category: string): Promise<Msds[]>;
  getMsdsItem(id: number): Promise<Msds | undefined>;
  createMsds(msds: InsertMsds): Promise<Msds>;
  updateMsds(id: number, msds: Partial<InsertMsds>): Promise<Msds | undefined>;
  deleteMsds(id: number): Promise<boolean>;

  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // QA Samples
  getQaSamples(): Promise<QaSample[]>;
  getQaSample(id: number): Promise<QaSample | undefined>;
  createQaSample(qaSample: InsertQaSample): Promise<QaSample>;
  updateQaSample(id: number, qaSample: Partial<InsertQaSample>): Promise<QaSample | undefined>;
  deleteQaSample(id: number): Promise<boolean>;

  // QA Test Results
  getQaTestResults(): Promise<QaTestResult[]>;
  getQaTestResult(id: number): Promise<QaTestResult | undefined>;
  createQaTestResult(testResult: InsertQaTestResult): Promise<QaTestResult>;
  updateQaTestResult(id: number, testResult: InsertQaTestResult): Promise<QaTestResult | undefined>;
  deleteQaTestResult(id: number): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    overdueCount: number;
    calibrationDue: number;
    pendingTasks: number;
    completedTraining: number;
  }>;
}

export class MemStorage implements IStorage {
  private tools: Map<number, Tool> = new Map();
  private toolCalibrationHistory: Map<number, ToolCalibrationHistory> = new Map();
  private glassware: Map<number, Glassware> = new Map();
  private glasswareCalibrationHistory: Map<number, GlasswareCalibrationHistory> = new Map();
  private chemicals: Map<number, Chemical> = new Map();
  private documents: Map<number, Document> = new Map();
  private training: Map<number, Training> = new Map();
  private msds: Map<number, Msds> = new Map();
  private tasks: Map<number, Task> = new Map();
  private qaSamples: Map<number, QaSample> = new Map();
  private qaTestResults: Map<number, QaTestResult> = new Map();
  private currentId: number = 100;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock Tools Data
    const mockTools: Tool[] = [
      {
        id: 1, code: "BAL-001", name: "เครื่องชั่งวิเคราะห์", brand: "Mettler Toledo", serialNumber: "MT2024001",
        range: "0.1mg - 220g", location: "ห้องชั่งวิเคราะห์", status: "active",
        lastCalibration: new Date("2024-01-15"), nextCalibration: new Date("2025-01-15"),
        calibrationStatus: "passed", calibrationResult: "ผ่าน", calibrationCertificate: "CAL-2024-001",
        calibrationBy: "บริษัท เมตเทลอร์ โทเลโด", calibrationMethod: "External Weight",
        calibrationRemarks: "การสอบเทียบปกติ", responsible: "นางสาว สมใจ ใจดี", notes: "ใช้งานปกติ"
      },
      {
        id: 2, code: "PH-001", name: "เครื่องวัด pH", brand: "Hanna Instruments", serialNumber: "HI2024002",
        range: "pH 0.00 - 14.00", location: "ห้องปฏิบัติการ A", status: "active",
        lastCalibration: new Date("2024-06-01"), nextCalibration: new Date("2024-09-01"),
        calibrationStatus: "upcoming", calibrationResult: "ผ่าน", calibrationCertificate: "CAL-2024-015",
        calibrationBy: "ทีมภายใน", calibrationMethod: "Buffer Solution", 
        calibrationRemarks: "ใช้ Buffer pH 4.01, 7.00, 10.01", responsible: "นาย วิทย์ วิทยา", notes: "ตรวจสอบ electrode เป็นประจำ"
      },
      {
        id: 3, code: "PIP-001", name: "ไปเปต 1000µL", brand: "Eppendorf", serialNumber: "EP2024003",
        range: "100-1000µL", location: "ห้องไมโครไบโอโลยี", status: "active",
        lastCalibration: new Date("2024-03-15"), nextCalibration: new Date("2024-09-15"),
        calibrationStatus: "passed", calibrationResult: "ผ่าน", calibrationCertificate: "CAL-2024-008",
        calibrationBy: "บริษัท เอพเพนดอร์ฟ", calibrationMethod: "Gravimetric Method",
        calibrationRemarks: "ความแม่นยำ ±0.5%", responsible: "นาง วิภา วิภาว", notes: "เปลี่ยน tip เป็นประจำ"
      },
      {
        id: 4, code: "INC-001", name: "ตู้เพาะเชื้อ", brand: "Thermo Scientific", serialNumber: "TS2024004",
        range: "5-70°C", location: "ห้องไมโครไบโอโลยี", status: "repair",
        lastCalibration: new Date("2024-02-01"), nextCalibration: new Date("2024-08-01"),
        calibrationStatus: "overdue", calibrationResult: "ไม่ผ่าน", calibrationCertificate: "CAL-2024-005",
        calibrationBy: "ทีมภายใน", calibrationMethod: "Temperature Mapping",
        calibrationRemarks: "พบจุดร้อนในช่วงอุณหภูมิ 37°C", responsible: "นาย สมชาย ซ่อม", notes: "กำลังซ่อมแซม"
      },
      {
        id: 5, code: "CON-001", name: "เครื่องวัดค่าการนำไฟฟ้า", brand: "Hach", serialNumber: "HC2024005",
        range: "0.1-2000µS/cm", location: "ห้องปฏิบัติการน้ำ", status: "active",
        lastCalibration: new Date("2024-05-20"), nextCalibration: new Date("2024-11-20"),
        calibrationStatus: "passed", calibrationResult: "ผ่าน", calibrationCertificate: "CAL-2024-012",
        calibrationBy: "บริษัท ฮาช", calibrationMethod: "Standard Solution",
        calibrationRemarks: "ใช้สารละลาย KCl มาตรฐาน", responsible: "นางสาว น้ำใส น้ำใจ", notes: "ล้างเซลล์เป็นประจำ"
      }
    ];

    // Mock Glassware Data
    const mockGlassware: Glassware[] = [
      {
        id: 6, code: "VOL-001", lotNumber: "LOT2024001", type: "Volumetric Flask", class: "A",
        brand: "Schott Duran", receivedDate: new Date("2024-01-10"), location: "ตู้เก็บแก้ว A",
        lastCalibration: new Date("2024-01-15"), nextCalibration: new Date("2025-01-15"),
        calibrationStatus: "passed", calibrationResult: "ผ่าน", calibrationCertificate: "VOL-2024-001",
        calibrationBy: "ทีมภายใน", calibrationMethod: "Gravimetric",
        calibrationRemarks: "ปริมาตร 100mL ±0.1mL", responsible: "นาย แก้ว ใส", notes: "ใช้สำหรับสารละลายมาตรฐาน"
      },
      {
        id: 7, code: "BUR-001", lotNumber: "LOT2024002", type: "Burette", class: "B",
        brand: "Pyrex", receivedDate: new Date("2024-02-01"), location: "ตู้เก็บแก้ว B",
        lastCalibration: new Date("2024-02-05"), nextCalibration: new Date("2025-02-05"),
        calibrationStatus: "passed", calibrationResult: "ผ่าน", calibrationCertificate: "BUR-2024-001",
        calibrationBy: "ทีมภายใน", calibrationMethod: "Volume Delivery",
        calibrationRemarks: "ปริมาตร 50mL ±0.05mL", responsible: "นางสาว ใส ใสใจ", notes: "ใช้สำหรับการไทเทรต"
      },
      {
        id: 8, code: "BEA-001", lotNumber: "LOT2024003", type: "Beaker", class: "B",
        brand: "Borosilicate", receivedDate: new Date("2024-01-20"), location: "ตู้เก็บแก้ว C",
        lastCalibration: null, nextCalibration: null, calibrationStatus: null,
        calibrationResult: null, calibrationCertificate: null, calibrationBy: null,
        calibrationMethod: null, calibrationRemarks: null,
        responsible: "นาย เบกเกอร์ กิน", notes: "ใช้ทั่วไป"
      }
    ];

    // Mock Chemicals Data
    const mockChemicals: Chemical[] = [
      {
        id: 9, chemicalNo: "CHE-001", code: "HCL-37", casNo: "7647-01-0",
        name: "Hydrochloric Acid", brand: "Merck", grade: "ACS",
        packageSize: "2.5L", lotNumber: "MKBK1234", molecularFormula: "HCl",
        molecularWeight: "36.458", receivedDate: new Date("2024-01-15"),
        expiryDate: new Date("2025-01-15"), location: "ตู้เก็บกรด", category: "qa",
        notes: "ใช้สำหรับการปรับ pH"
      },
      {
        id: 10, chemicalNo: "CHE-002", code: "NAOH-50", casNo: "1310-73-2",
        name: "Sodium Hydroxide", brand: "Carlo Erba", grade: "AR",
        packageSize: "500g", lotNumber: "CE5678", molecularFormula: "NaOH",
        molecularWeight: "39.997", receivedDate: new Date("2024-02-01"),
        expiryDate: new Date("2026-02-01"), location: "ตู้เก็บเบส", category: "qa",
        notes: "เก็บในที่แห้ง ระวังการดูดความชื้น"
      },
      {
        id: 11, chemicalNo: "STD-001", code: "KHP-99", casNo: "877-24-7",
        name: "Potassium Hydrogen Phthalate", brand: "NIST", grade: "Standard",
        packageSize: "25g", lotNumber: "SRM84j", molecularFormula: "C8H5KO4",
        molecularWeight: "204.22", receivedDate: new Date("2024-01-20"),
        expiryDate: new Date("2027-01-20"), location: "ตู้เก็บสารมาตรฐาน", category: "standard",
        notes: "Primary Standard สำหรับ Acid-Base Titration"
      },
      {
        id: 12, chemicalNo: "RD-001", code: "BPA-98", casNo: "80-05-7",
        name: "Bisphenol A", brand: "Sigma-Aldrich", grade: "GR",
        packageSize: "100g", lotNumber: "SA9012", molecularFormula: "C15H16O2",
        molecularWeight: "228.29", receivedDate: new Date("2024-03-10"),
        expiryDate: new Date("2025-09-10"), location: "ตู้เก็บสารวิจัย", category: "rd",
        notes: "ใช้สำหรับวิจัย Endocrine Disruptor"
      },
      {
        id: 13, chemicalNo: "CHE-003", code: "H2SO4-96", casNo: "7664-93-9",
        name: "Sulfuric Acid", brand: "Merck", grade: "ACS",
        packageSize: "1L", lotNumber: "MKCD3456", molecularFormula: "H2SO4",
        molecularWeight: "98.08", receivedDate: new Date("2024-04-01"),
        expiryDate: new Date("2025-10-01"), location: "ตู้เก็บกรด", category: "qa",
        notes: "ระวังการใช้งาน สวมใส่ PPE"
      },
      // Add expired chemical
      {
        id: 50, chemicalNo: "CHE-004", code: "ACE-99", casNo: "67-64-1",
        name: "Acetone", brand: "Fisher", grade: "HPLC",
        packageSize: "1L", lotNumber: "FI7890", molecularFormula: "C3H6O",
        molecularWeight: "58.08", receivedDate: new Date("2023-05-01"),
        expiryDate: new Date("2024-05-01"), location: "ตู้เก็บตัวทำละลาย", category: "qa",
        notes: "หมดอายุแล้ว - รอกำจัด"
      },
      // Add due soon chemical
      {
        id: 51, chemicalNo: "CHE-005", code: "METH-99", casNo: "67-56-1", 
        name: "Methanol", brand: "J.T.Baker", grade: "HPLC",
        packageSize: "4L", lotNumber: "JT2024", molecularFormula: "CH4O",
        molecularWeight: "32.04", receivedDate: new Date("2024-06-01"),
        expiryDate: new Date("2024-08-15"), location: "ตู้เก็บตัวทำละลาย", category: "rd",
        notes: "ใกล้หมดอายุ - เตรียมสั่งใหม่"
      }
    ];

    // Mock Documents Data
    const mockDocuments: Document[] = [
      {
        id: 14, sequence: "QM-001", title: "คู่มือระบบคุณภาพ", documentCode: "QM-LAB-001",
        effectiveDate: new Date("2024-01-01"), revision: 2, category: "quality_manual",
        filePath: "/documents/QM-LAB-001-Rev2.pdf", notes: "ปรับปรุงตาม ISO 17025:2017"
      },
      {
        id: 15, sequence: "WI-001", title: "วิธีการทดสอบ pH ในน้ำ", documentCode: "WI-WATER-001",
        effectiveDate: new Date("2024-02-15"), revision: 1, category: "work_manual",
        filePath: "/documents/WI-WATER-001-Rev1.pdf", notes: "อ้างอิง ASTM D1293"
      },
      {
        id: 16, sequence: "SOP-001", title: "การสอบเทียบเครื่องชั่งวิเคราะห์", documentCode: "SOP-CAL-001",
        effectiveDate: new Date("2024-01-20"), revision: 0, category: "procedures",
        filePath: "/documents/SOP-CAL-001-Rev0.pdf", notes: "ขั้นตอนการสอบเทียบภายใน"
      },
      {
        id: 17, sequence: "FORM-001", title: "ใบบันทึกการสอบเทียบ", documentCode: "FORM-CAL-001",
        effectiveDate: new Date("2024-01-01"), revision: 1, category: "forms",
        filePath: "/documents/FORM-CAL-001-Rev1.pdf", notes: "แบบฟอร์มมาตรฐาน"
      },
      {
        id: 18, sequence: "ANN-001", title: "ประกาศเปลี่ยนแปลงระบบ LIMS", documentCode: "ANN-SYS-001",
        effectiveDate: new Date("2024-06-01"), revision: 0, category: "announcements",
        filePath: "/documents/ANN-SYS-001-Rev0.pdf", notes: "มีผลบังคับใช้ 1 ส.ค. 2567"
      }
    ];

    // Mock Training Data
    const mockTraining: Training[] = [
      {
        id: 19, sequence: "TRN-001", course: "ISO 17025:2017 Internal Audit",
        startDate: new Date("2024-03-01"), endDate: new Date("2024-03-03"),
        assessmentLevel: 3, result: "passed", trainee: "นางสาว สมใจ ใจดี",
        acknowledgedDate: new Date("2024-03-04"), trainer: "ผู้เชี่ยวชาญภายนอก",
        signedDate: new Date("2024-03-05"), notes: "ผ่านการประเมิน 85%"
      },
      {
        id: 20, sequence: "TRN-002", course: "การใช้งานเครื่อง GC-MS",
        startDate: new Date("2024-04-15"), endDate: new Date("2024-04-17"),
        assessmentLevel: 2, result: "passed", trainee: "นาย วิทย์ วิทยา",
        acknowledgedDate: new Date("2024-04-18"), trainer: "บริษัท Agilent",
        signedDate: new Date("2024-04-20"), notes: "การฝึกอบรมเชิงปฏิบัติ"
      },
      {
        id: 21, sequence: "TRN-003", course: "Safety in Laboratory",
        startDate: new Date("2024-05-10"), endDate: new Date("2024-05-10"),
        assessmentLevel: 1, result: "passed", trainee: "นาง วิภา วิภาว",
        acknowledgedDate: new Date("2024-05-11"), trainer: "ทีมภายใน",
        signedDate: new Date("2024-05-12"), notes: "อบรมประจำปี"
      },
      {
        id: 22, sequence: "TRN-004", course: "Microbiological Testing Methods",
        startDate: new Date("2024-06-20"), endDate: new Date("2024-06-22"),
        assessmentLevel: 2, result: "failed", trainee: "นาย สมชาย ซ่อม",
        acknowledgedDate: null, trainer: "ผู้เชี่ยวชาญภายนอก",
        signedDate: null, notes: "จำเป็นต้องฝึกอบรมเพิ่มเติม"
      },
      // Add more training with passed results
      {
        id: 54, sequence: "TRN-005", course: "Statistical Quality Control",
        startDate: new Date("2024-07-01"), endDate: new Date("2024-07-02"),
        assessmentLevel: 2, result: "passed", trainee: "นางสาว สถิติ ดี",
        acknowledgedDate: new Date("2024-07-03"), trainer: "ผู้เชี่ยวชาญ SQC",
        signedDate: new Date("2024-07-05"), notes: "เข้าใจเรื่อง Control Chart เป็นอย่างดี"
      }
    ];

    // Mock MSDS Data  
    const mockMsds: Msds[] = [
      {
        id: 23, sequence: "SDS-001", title: "Safety Data Sheet - Hydrochloric Acid",
        documentCode: "SDS-HCL-001", effectiveDate: new Date("2024-01-01"),
        revision: 1, category: "sds_lab", filePath: "/msds/SDS-HCL-001-Rev1.pdf",
        notes: "อัปเดตข้อมูลการขนส่ง"
      },
      {
        id: 24, sequence: "SDS-002", title: "Safety Data Sheet - Sodium Hydroxide",
        documentCode: "SDS-NAOH-001", effectiveDate: new Date("2024-02-01"),
        revision: 0, category: "sds_lab", filePath: "/msds/SDS-NAOH-001-Rev0.pdf",
        notes: "เอกสารใหม่"
      },
      {
        id: 25, sequence: "SDS-003", title: "Safety Data Sheet - Sulfuric Acid",
        documentCode: "SDS-H2SO4-001", effectiveDate: new Date("2024-01-15"),
        revision: 2, category: "sds_lab", filePath: "/msds/SDS-H2SO4-001-Rev2.pdf",
        notes: "ปรับปรุงข้อมูลการปฐมพยาบาล"
      }
    ];

    // Add more MSDS data with different categories
    mockMsds.push(
      {
        id: 52, sequence: "SDS-004", title: "Safety Data Sheet - Product ABC",
        documentCode: "SDS-PROD-001", effectiveDate: new Date("2024-03-01"),
        revision: 0, category: "sds_product", filePath: "/msds/SDS-PROD-001-Rev0.pdf",
        notes: "SDS สำหรับผลิตภัณฑ์ลูกค้า"
      },
      {
        id: 53, sequence: "SDS-005", title: "Safety Data Sheet - Reference Material CRM",
        documentCode: "SDS-RM-001", effectiveDate: new Date("2024-04-01"),
        revision: 1, category: "sds_rm", filePath: "/msds/SDS-RM-001-Rev1.pdf",
        notes: "SDS สำหรับ Reference Material"
      }
    );

    // Mock Tasks Data
    const mockTasks: Task[] = [
      {
        id: 26, title: "สอบเทียบเครื่องชั่งวิเคราะห์ BAL-001",
        description: "ทำการสอบเทียบเครื่องชั่งวิเคราะห์ตามกำหนดการ",
        responsible: "นางสาว สมใจ ใจดี", startDate: new Date("2024-07-01"),
        dueDate: new Date("2024-07-15"), status: "in_progress", priority: "high",
        progress: 60, subtasks: [
          { id: 1, title: "เตรียมน้ำหนักมาตรฐาน", completed: true },
          { id: 2, title: "ทำการสอบเทียบ", completed: true },
          { id: 3, title: "บันทึกผล", completed: false },
          { id: 4, title: "ออกใบรับรอง", completed: false }
        ]
      },
      {
        id: 27, title: "ตรวจสอบอุณหภูมิตู้เพาะเชื้อ",
        description: "ตรวจสอบและปรับแต่งระบบควบคุมอุณหภูมิ",
        responsible: "นาย สมชาย ซ่อม", startDate: new Date("2024-07-10"),
        dueDate: new Date("2024-07-20"), status: "pending", priority: "medium",
        progress: 0, subtasks: []
      },
      {
        id: 28, title: "อบรม Safety ประจำปี",
        description: "จัดอบรมความปลอดภัยในห้องปฏิบัติการ",
        responsible: "นาง วิภา วิภาว", startDate: new Date("2024-06-01"),
        dueDate: new Date("2024-06-30"), status: "completed", priority: "low",
        progress: 100, subtasks: [
          { id: 1, title: "เตรียมเอกสาร", completed: true },
          { id: 2, title: "จองห้องประชุม", completed: true },
          { id: 3, title: "ดำเนินการอบรม", completed: true },
          { id: 4, title: "ประเมินผล", completed: true }
        ]
      },
      // Add more tasks with different statuses
      {
        id: 55, title: "ปรับปรุงระบบ LIMS", 
        description: "อัพเดตระบบจัดการข้อมูลห้องปฏิบัติการ",
        responsible: "ทีม IT", startDate: new Date("2024-07-15"),
        dueDate: new Date("2024-08-30"), status: "cancelled", priority: "medium",
        progress: 25, subtasks: []
      },
      {
        id: 56, title: "ตรวจสอบคุณภาพน้ำประปา",
        description: "ทดสอบคุณภาพน้ำประปาประจำเดือน", 
        responsible: "นางสาว น้ำใส น้ำใจ", startDate: new Date("2024-07-20"),
        dueDate: new Date("2024-07-25"), status: "completed", priority: "high",
        progress: 100, subtasks: []
      }
    ];

    // Mock Tool Calibration History
    const mockToolCalibrationHistory: ToolCalibrationHistory[] = [
      // History for Tool ID 1 (เครื่องชั่งวิเคราะห์)
      { id: 1001, toolId: 1, calibrationDate: new Date("2024-01-15"), result: "ผ่าน", certificateNumber: "CAL-2024-001", 
        calibratedBy: "บริษัท เมตเทลอร์ โทเลโด", method: "External Weight", remarks: "การสอบเทียบปกติ", nextCalibrationDate: new Date("2025-01-15") },
      { id: 1002, toolId: 1, calibrationDate: new Date("2023-01-10"), result: "ผ่าน", certificateNumber: "CAL-2023-001", 
        calibratedBy: "บริษัท เมตเทลอร์ โทเลโด", method: "External Weight", remarks: "การสอบเทียบปกติ", nextCalibrationDate: new Date("2024-01-10") },
      { id: 1003, toolId: 1, calibrationDate: new Date("2022-01-12"), result: "ผ่าน", certificateNumber: "CAL-2022-001", 
        calibratedBy: "บริษัท เมตเทลอร์ โทเลโด", method: "External Weight", remarks: "การสอบเทียบปกติ", nextCalibrationDate: new Date("2023-01-12") },
      
      // History for Tool ID 2 (เครื่องวัด pH)  
      { id: 1004, toolId: 2, calibrationDate: new Date("2024-06-01"), result: "ผ่าน", certificateNumber: "CAL-2024-015", 
        calibratedBy: "ทีมภายใน", method: "Buffer Solution", remarks: "ใช้ Buffer pH 4.01, 7.00, 10.01", nextCalibrationDate: new Date("2024-09-01") },
      { id: 1005, toolId: 2, calibrationDate: new Date("2024-03-01"), result: "ผ่าน", certificateNumber: "CAL-2024-008", 
        calibratedBy: "ทีมภายใน", method: "Buffer Solution", remarks: "ใช้ Buffer pH 4.01, 7.00, 10.01", nextCalibrationDate: new Date("2024-06-01") },
      { id: 1006, toolId: 2, calibrationDate: new Date("2023-12-01"), result: "ผ่าน", certificateNumber: "CAL-2023-045", 
        calibratedBy: "ทีมภายใน", method: "Buffer Solution", remarks: "เปลี่ยน electrode ใหม่", nextCalibrationDate: new Date("2024-03-01") },
      
      // History for Tool ID 4 (ตู้เพาะเชื้อ) - มีปัญหา
      { id: 1007, toolId: 4, calibrationDate: new Date("2024-02-01"), result: "ไม่ผ่าน", certificateNumber: "CAL-2024-005", 
        calibratedBy: "ทีมภายใน", method: "Temperature Mapping", remarks: "พบจุดร้อนในช่วงอุณหภูมิ 37°C - ส่งซ่อม", nextCalibrationDate: new Date("2024-08-01") },
      { id: 1008, toolId: 4, calibrationDate: new Date("2023-08-01"), result: "ผ่าน", certificateNumber: "CAL-2023-025", 
        calibratedBy: "ทีมภายใน", method: "Temperature Mapping", remarks: "การสอบเทียบปกติ", nextCalibrationDate: new Date("2024-02-01") },
      { id: 1009, toolId: 4, calibrationDate: new Date("2023-02-01"), result: "ผ่าน", certificateNumber: "CAL-2023-005", 
        calibratedBy: "ทีมภายใน", method: "Temperature Mapping", remarks: "การสอบเทียบปกติ", nextCalibrationDate: new Date("2023-08-01") },
    ];

    // Mock Glassware Calibration History
    const mockGlasswareCalibrationHistory: GlasswareCalibrationHistory[] = [
      // History for Glassware ID 6 (Volumetric Flask)
      { id: 2001, glasswareId: 6, calibrationDate: new Date("2024-01-15"), result: "ผ่าน", certificateNumber: "VOL-2024-001", 
        calibratedBy: "ทีมภายใน", method: "Gravimetric", remarks: "ปริมาตร 100mL ±0.1mL", nextCalibrationDate: new Date("2025-01-15") },
      { id: 2002, glasswareId: 6, calibrationDate: new Date("2023-01-10"), result: "ผ่าน", certificateNumber: "VOL-2023-001", 
        calibratedBy: "ทีมภายใน", method: "Gravimetric", remarks: "ปริมาตร 100mL ±0.1mL", nextCalibrationDate: new Date("2024-01-10") },
      { id: 2003, glasswareId: 6, calibrationDate: new Date("2022-01-12"), result: "ผ่าน", certificateNumber: "VOL-2022-001", 
        calibratedBy: "ทีมภายใน", method: "Gravimetric", remarks: "ปริมาตร 100mL ±0.1mL", nextCalibrationDate: new Date("2023-01-12") },
      
      // History for Glassware ID 7 (Burette)
      { id: 2004, glasswareId: 7, calibrationDate: new Date("2024-02-05"), result: "ผ่าน", certificateNumber: "BUR-2024-001", 
        calibratedBy: "ทีมภายใน", method: "Volume Delivery", remarks: "ปริมาตร 50mL ±0.05mL", nextCalibrationDate: new Date("2025-02-05") },
      { id: 2005, glasswareId: 7, calibrationDate: new Date("2023-02-01"), result: "ผ่าน", certificateNumber: "BUR-2023-001", 
        calibratedBy: "ทีมภายใน", method: "Volume Delivery", remarks: "ปริมาตร 50mL ±0.05mL", nextCalibrationDate: new Date("2024-02-01") },
    ];

    // Mock QA Samples Data
    const mockQaSamples: QaSample[] = [
      {
        id: 29, requestNo: "REQ-001", receivedTime: "09:30",
        receivedDate: new Date("2024-07-01"), dueDate: new Date("2024-07-08"),
        quotationNo: "QUO-2024-001", contactPerson: "นาย สมชาย ลูกค้า",
        phone: "02-123-4567", email: "customer@example.com",
        companyName: "บริษัท ABC จำกัด", address: "123 ถนนสุขุมวิท กรุงเทพฯ",
        deliveryMethod: "walk_in", samples: [
          { name: "น้ำประปาเข้าระบบ", type: "Water", tests: ["pH", "Conductivity"] }
        ],
        storage: "chilled", postTesting: "return", condition: "normal", status: "testing"
      },
      {
        id: 30, requestNo: "REQ-002", receivedTime: "14:15",
        receivedDate: new Date("2024-07-03"), dueDate: new Date("2024-07-31"),
        quotationNo: null, contactPerson: "นางสาว ใจดี ดีใจ",
        phone: "02-987-6543", email: "goodheart@company.com",
        companyName: "บริษัท XYZ จำกัด", address: "456 ถนนพหลโยธิน กรุงเทพฯ",
        deliveryMethod: "courier", samples: [
          { name: "ผลิตภัณฑ์ชำระล้าง", type: "Product", tests: ["pH", "Surfactant"] }
        ],
        storage: "room_temp", postTesting: "dispose", condition: "normal", status: "completed"
      },
      // Add samples with different statuses
      {
        id: 57, requestNo: "REQ-003", receivedTime: "10:00",
        receivedDate: new Date("2024-07-05"), dueDate: new Date("2024-07-15"),
        quotationNo: "QUO-2024-003", contactPerson: "นาย ทดสอบ ผล",
        phone: "02-555-1234", email: "test@test.com", companyName: "บริษัท เทสต์ จำกัด",
        address: "789 ถนนเทสต์ กรุงเทพฯ", deliveryMethod: "walk_in", 
        samples: [{ name: "น้ำทิ้ง", type: "Waste", tests: ["COD", "BOD"] }],
        storage: "chilled", postTesting: "return", condition: "normal", status: "testing"
      },
      {
        id: 58, requestNo: "REQ-004", receivedTime: "16:30",
        receivedDate: new Date("2024-06-25"), dueDate: new Date("2024-07-05"),
        quotationNo: null, contactPerson: "นางสาว สำเร็จ งาน",
        phone: "02-999-8888", email: "success@done.com", companyName: "บริษัท เสร็จแล้ว จำกัด",
        address: "321 ถนนสำเร็จ กรุงเทพฯ", deliveryMethod: "post",
        samples: [{ name: "น้ำดื่ม", type: "Drinking Water", tests: ["Microbe", "Heavy Metal"] }],
        storage: "room_temp", postTesting: "dispose", condition: "normal", status: "completed"
      },
      {
        id: 59, requestNo: "REQ-005", receivedTime: "11:45", 
        receivedDate: new Date("2024-06-20"), dueDate: new Date("2024-06-30"),
        quotationNo: "QUO-2024-005", contactPerson: "นาย ส่งมอบ รายงาน",
        phone: "02-777-6666", email: "deliver@report.com", companyName: "บริษัท ส่งแล้ว จำกัด",
        address: "654 ถนนส่งมอบ กรุงเทพฯ", deliveryMethod: "courier",
        samples: [{ name: "ของเล่น", type: "Toy", tests: ["Heavy Metal", "Phthalate"] }],
        storage: "room_temp", postTesting: "return", condition: "normal", status: "delivered"
      },
      {
        id: 60, requestNo: "REQ-006", receivedTime: "08:15",
        receivedDate: new Date("2024-07-10"), dueDate: new Date("2024-07-20"),
        quotationNo: "QUO-2024-006", contactPerson: "นางสาว รับใหม่ ใส",
        phone: "02-111-2222", email: "newreceive@fresh.com", companyName: "บริษัท รับใหม่ จำกัด", 
        address: "987 ถนนใหม่ กรุงเทพฯ", deliveryMethod: "walk_in",
        samples: [{ name: "อาหาร", type: "Food", tests: ["Microbe", "Additive"] }],
        storage: "frozen", postTesting: "dispose", condition: "normal", status: "received"
      }
    ];

    // Mock QA Test Results Data
    const mockQaTestResults: QaTestResult[] = [
      {
        id: 31, sampleNo: "SAMPLE-001", requestNo: "REQ-002",
        product: "ผลิตภัณฑ์ชำระล้าง", dueDate: new Date("2024-07-31"),
        testItems: [
          { parameter: "pH", result: "7.2", unit: "pH unit", method: "ASTM D1293", status: "passed" },
          { parameter: "Surfactant", result: "12.5", unit: "%", method: "Internal", status: "passed" }
        ],
        recordDate: new Date("2024-07-05"), status: "completed", notes: "ทุกการทดสอบผ่าน"
      },
      {
        id: 32, sampleNo: "SAMPLE-002", requestNo: "REQ-001",
        product: "น้ำประปา", dueDate: new Date("2024-07-08"),
        testItems: [
          { parameter: "pH", result: "6.8", unit: "pH unit", method: "ASTM D1293", status: "passed" },
          { parameter: "Conductivity", result: "245", unit: "µS/cm", method: "ASTM D1125", status: "testing" }
        ],
        recordDate: new Date("2024-07-06"), status: "in_progress", notes: "รอผลการทดสอบ Conductivity"
      }
    ];

    // Initialize all data
    mockTools.forEach(tool => this.tools.set(tool.id, tool));
    mockToolCalibrationHistory.forEach(history => this.toolCalibrationHistory.set(history.id, history));
    mockGlassware.forEach(item => this.glassware.set(item.id, item));
    mockGlasswareCalibrationHistory.forEach(history => this.glasswareCalibrationHistory.set(history.id, history));
    mockChemicals.forEach(chemical => this.chemicals.set(chemical.id, chemical));
    mockDocuments.forEach(doc => this.documents.set(doc.id, doc));
    mockTraining.forEach(training => this.training.set(training.id, training));
    mockMsds.forEach(msds => this.msds.set(msds.id, msds));
    mockTasks.forEach(task => this.tasks.set(task.id, task));
    mockQaSamples.forEach(sample => this.qaSamples.set(sample.id, sample));
    mockQaTestResults.forEach(result => this.qaTestResults.set(result.id, result));

    // Set current ID to continue from the highest ID used
    const allIds = [
      ...mockTools.map(t => t.id),
      ...mockToolCalibrationHistory.map(h => h.id),
      ...mockGlassware.map(g => g.id),
      ...mockGlasswareCalibrationHistory.map(h => h.id),
      ...mockChemicals.map(c => c.id),
      ...mockDocuments.map(d => d.id),
      ...mockTraining.map(t => t.id),
      ...mockMsds.map(m => m.id),
      ...mockTasks.map(t => t.id),
      ...mockQaSamples.map(s => s.id),
      ...mockQaTestResults.map(r => r.id)
    ];
    this.currentId = Math.max(...allIds) + 1;
  }

  // Tools
  async getTools(): Promise<Tool[]> {
    return Array.from(this.tools.values());
  }

  async getTool(id: number): Promise<Tool | undefined> {
    return this.tools.get(id);
  }

  async createTool(tool: InsertTool): Promise<Tool> {
    const id = this.currentId++;
    const newTool: Tool = { 
      ...tool, 
      id,
      status: tool.status ?? null,
      serialNumber: tool.serialNumber ?? null,
      range: tool.range ?? null,
      lastCalibration: tool.lastCalibration ?? null,
      nextCalibration: tool.nextCalibration ?? null,
      calibrationStatus: tool.calibrationStatus ?? null,
      calibrationResult: tool.calibrationResult ?? null,
      calibrationCertificate: tool.calibrationCertificate ?? null,
      calibrationBy: tool.calibrationBy ?? null,
      calibrationMethod: tool.calibrationMethod ?? null,
      calibrationRemarks: tool.calibrationRemarks ?? null,
      responsible: tool.responsible ?? null,
      notes: tool.notes ?? null
    };
    this.tools.set(id, newTool);
    return newTool;
  }

  async updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool | undefined> {
    const existingTool = this.tools.get(id);
    if (!existingTool) return undefined;
    
    const updatedTool = { ...existingTool, ...tool };
    this.tools.set(id, updatedTool);
    return updatedTool;
  }

  async deleteTool(id: number): Promise<boolean> {
    return this.tools.delete(id);
  }

  // Tool Calibration History
  async getToolCalibrationHistory(toolId: number): Promise<ToolCalibrationHistory[]> {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    
    return Array.from(this.toolCalibrationHistory.values())
      .filter(history => 
        history.toolId === toolId && 
        history.calibrationDate >= fiveYearsAgo
      )
      .sort((a, b) => new Date(b.calibrationDate).getTime() - new Date(a.calibrationDate).getTime());
  }

  async createToolCalibrationHistory(history: InsertToolCalibrationHistory): Promise<ToolCalibrationHistory> {
    const id = this.currentId++;
    const newHistory: ToolCalibrationHistory = { ...history, id };
    this.toolCalibrationHistory.set(id, newHistory);
    return newHistory;
  }

  // Glassware
  async getGlassware(): Promise<Glassware[]> {
    return Array.from(this.glassware.values());
  }

  async getGlasswareItem(id: number): Promise<Glassware | undefined> {
    return this.glassware.get(id);
  }

  async createGlassware(glassware: InsertGlassware): Promise<Glassware> {
    const id = this.currentId++;
    const newGlassware: Glassware = { 
      ...glassware, 
      id,
      class: glassware.class ?? null,
      brand: glassware.brand ?? null,
      lotNumber: glassware.lotNumber ?? null,
      receivedDate: glassware.receivedDate ?? null,
      lastCalibration: glassware.lastCalibration ?? null,
      nextCalibration: glassware.nextCalibration ?? null,
      calibrationStatus: glassware.calibrationStatus ?? null,
      calibrationResult: glassware.calibrationResult ?? null,
      calibrationCertificate: glassware.calibrationCertificate ?? null,
      calibrationBy: glassware.calibrationBy ?? null,
      calibrationMethod: glassware.calibrationMethod ?? null,
      calibrationRemarks: glassware.calibrationRemarks ?? null,
      responsible: glassware.responsible ?? null,
      notes: glassware.notes ?? null
    };
    this.glassware.set(id, newGlassware);
    return newGlassware;
  }

  async updateGlassware(id: number, glassware: Partial<InsertGlassware>): Promise<Glassware | undefined> {
    const existingGlassware = this.glassware.get(id);
    if (!existingGlassware) return undefined;
    
    const updatedGlassware = { ...existingGlassware, ...glassware };
    this.glassware.set(id, updatedGlassware);
    return updatedGlassware;
  }

  async deleteGlassware(id: number): Promise<boolean> {
    return this.glassware.delete(id);
  }

  // Glassware Calibration History
  async getGlasswareCalibrationHistory(glasswareId: number): Promise<GlasswareCalibrationHistory[]> {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    
    return Array.from(this.glasswareCalibrationHistory.values())
      .filter(history => 
        history.glasswareId === glasswareId && 
        history.calibrationDate >= fiveYearsAgo
      )
      .sort((a, b) => new Date(b.calibrationDate).getTime() - new Date(a.calibrationDate).getTime());
  }

  async createGlasswareCalibrationHistory(history: InsertGlasswareCalibrationHistory): Promise<GlasswareCalibrationHistory> {
    const id = this.currentId++;
    const newHistory: GlasswareCalibrationHistory = { ...history, id };
    this.glasswareCalibrationHistory.set(id, newHistory);
    return newHistory;
  }

  // Chemicals
  async getChemicals(): Promise<Chemical[]> {
    return Array.from(this.chemicals.values());
  }

  async getChemicalsByCategory(category: string): Promise<Chemical[]> {
    return Array.from(this.chemicals.values()).filter(c => c.category === category);
  }

  async getChemical(id: number): Promise<Chemical | undefined> {
    return this.chemicals.get(id);
  }

  async createChemical(chemical: InsertChemical): Promise<Chemical> {
    const id = this.currentId++;
    const newChemical: Chemical = { 
      ...chemical, 
      id,
      code: chemical.code ?? null,
      brand: chemical.brand ?? null,
      grade: chemical.grade ?? null,
      packageSize: chemical.packageSize ?? null,
      lotNumber: chemical.lotNumber ?? null,
      molecularFormula: chemical.molecularFormula ?? null,
      molecularWeight: chemical.molecularWeight ?? null,
      casNo: chemical.casNo ?? null,
      receivedDate: chemical.receivedDate ?? null,
      expiryDate: chemical.expiryDate ?? null,
      notes: chemical.notes ?? null
    };
    this.chemicals.set(id, newChemical);
    return newChemical;
  }

  async updateChemical(id: number, chemical: Partial<InsertChemical>): Promise<Chemical | undefined> {
    const existingChemical = this.chemicals.get(id);
    if (!existingChemical) return undefined;
    
    const updatedChemical = { ...existingChemical, ...chemical };
    this.chemicals.set(id, updatedChemical);
    return updatedChemical;
  }

  async deleteChemical(id: number): Promise<boolean> {
    return this.chemicals.delete(id);
  }

  // Documents
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentsByCategory(category: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(d => d.category === category);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.currentId++;
    const newDocument: Document = { 
      ...document, 
      id,
      sequence: document.sequence ?? null,
      effectiveDate: document.effectiveDate ?? null,
      revision: document.revision ?? null,
      filePath: document.filePath ?? null,
      notes: document.notes ?? null
    };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) return undefined;
    
    const updatedDocument = { ...existingDocument, ...document };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  // Training
  async getTraining(): Promise<Training[]> {
    return Array.from(this.training.values());
  }

  async getTrainingItem(id: number): Promise<Training | undefined> {
    return this.training.get(id);
  }

  async createTraining(training: InsertTraining): Promise<Training> {
    const id = this.currentId++;
    const newTraining: Training = { 
      ...training, 
      id,
      sequence: training.sequence ?? null,
      startDate: training.startDate ?? null,
      endDate: training.endDate ?? null,
      assessmentLevel: training.assessmentLevel ?? null,
      result: training.result ?? null,
      acknowledgedDate: training.acknowledgedDate ?? null,
      trainer: training.trainer ?? null,
      signedDate: training.signedDate ?? null,
      notes: training.notes ?? null
    };
    this.training.set(id, newTraining);
    return newTraining;
  }

  async updateTraining(id: number, training: Partial<InsertTraining>): Promise<Training | undefined> {
    const existingTraining = this.training.get(id);
    if (!existingTraining) return undefined;
    
    const updatedTraining = { ...existingTraining, ...training };
    this.training.set(id, updatedTraining);
    return updatedTraining;
  }

  async deleteTraining(id: number): Promise<boolean> {
    return this.training.delete(id);
  }

  // MSDS
  async getMsds(): Promise<Msds[]> {
    return Array.from(this.msds.values());
  }

  async getMsdsByCategory(category: string): Promise<Msds[]> {
    return Array.from(this.msds.values()).filter(m => m.category === category);
  }

  async getMsdsItem(id: number): Promise<Msds | undefined> {
    return this.msds.get(id);
  }

  async createMsds(msds: InsertMsds): Promise<Msds> {
    const id = this.currentId++;
    const newMsds: Msds = { 
      ...msds, 
      id,
      sequence: msds.sequence ?? null,
      effectiveDate: msds.effectiveDate ?? null,
      revision: msds.revision ?? null,
      filePath: msds.filePath ?? null,
      notes: msds.notes ?? null
    };
    this.msds.set(id, newMsds);
    return newMsds;
  }

  async updateMsds(id: number, msds: Partial<InsertMsds>): Promise<Msds | undefined> {
    const existingMsds = this.msds.get(id);
    if (!existingMsds) return undefined;
    
    const updatedMsds = { ...existingMsds, ...msds };
    this.msds.set(id, updatedMsds);
    return updatedMsds;
  }

  async deleteMsds(id: number): Promise<boolean> {
    return this.msds.delete(id);
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.currentId++;
    const newTask: Task = { 
      ...task, 
      id,
      description: task.description ?? null,
      startDate: task.startDate ?? null,
      dueDate: task.dueDate ?? null,
      status: task.status ?? null,
      priority: task.priority ?? null,
      progress: task.progress ?? null,
      subtasks: task.subtasks ?? null
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask = { ...existingTask, ...task };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // QA Samples
  async getQaSamples(): Promise<QaSample[]> {
    return Array.from(this.qaSamples.values());
  }

  async getQaSample(id: number): Promise<QaSample | undefined> {
    return this.qaSamples.get(id);
  }

  async createQaSample(qaSample: InsertQaSample): Promise<QaSample> {
    const id = this.currentId++;
    const newQaSample: QaSample = { 
      ...qaSample, 
      id,
      quotationNo: qaSample.quotationNo ?? null,
      address: qaSample.address ?? null,
      status: qaSample.status ?? null,
      samples: qaSample.samples ?? null
    };
    this.qaSamples.set(id, newQaSample);
    return newQaSample;
  }

  async updateQaSample(id: number, qaSample: Partial<InsertQaSample>): Promise<QaSample | undefined> {
    const existingQaSample = this.qaSamples.get(id);
    if (!existingQaSample) return undefined;
    
    const updatedQaSample = { ...existingQaSample, ...qaSample };
    this.qaSamples.set(id, updatedQaSample);
    return updatedQaSample;
  }

  async deleteQaSample(id: number): Promise<boolean> {
    return this.qaSamples.delete(id);
  }

  // QA Test Results
  async getQaTestResults(): Promise<QaTestResult[]> {
    return Array.from(this.qaTestResults.values());
  }

  async getQaTestResult(id: number): Promise<QaTestResult | undefined> {
    return this.qaTestResults.get(id);
  }

  async createQaTestResult(testResult: InsertQaTestResult): Promise<QaTestResult> {
    const id = this.currentId++;
    const newTestResult: QaTestResult = { 
      ...testResult, 
      id,
      testItems: testResult.testItems ?? null,
      notes: testResult.notes ?? null,
      status: testResult.status ?? null
    };
    this.qaTestResults.set(id, newTestResult);
    return newTestResult;
  }

  async updateQaTestResult(id: number, testResult: InsertQaTestResult): Promise<QaTestResult | undefined> {
    const existingTestResult = this.qaTestResults.get(id);
    if (!existingTestResult) return undefined;
    
    const updatedTestResult = { ...existingTestResult, ...testResult };
    this.qaTestResults.set(id, updatedTestResult);
    return updatedTestResult;
  }

  async deleteQaTestResult(id: number): Promise<boolean> {
    return this.qaTestResults.delete(id);
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    overdueCount: number;
    calibrationDue: number;
    pendingTasks: number;
    completedTraining: number;
  }> {
    const now = new Date();
    const tools = Array.from(this.tools.values());
    const glassware = Array.from(this.glassware.values());
    const tasks = Array.from(this.tasks.values());
    const training = Array.from(this.training.values());
    const chemicals = Array.from(this.chemicals.values());

    // Count overdue items (tools, glassware with expired calibration, expired chemicals)
    const overdueTools = tools.filter(t => t.nextCalibration && new Date(t.nextCalibration) < now).length;
    const overdueGlassware = glassware.filter(g => g.nextCalibration && new Date(g.nextCalibration) < now).length;
    const expiredChemicals = chemicals.filter(c => c.expiryDate && new Date(c.expiryDate) < now).length;
    const overdueCount = overdueTools + overdueGlassware + expiredChemicals;

    // Count calibration due (within 30 days)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const toolsDue = tools.filter(t => 
      t.nextCalibration && 
      new Date(t.nextCalibration) > now && 
      new Date(t.nextCalibration) <= thirtyDaysFromNow
    ).length;
    const glasswareDue = glassware.filter(g => 
      g.nextCalibration && 
      new Date(g.nextCalibration) > now && 
      new Date(g.nextCalibration) <= thirtyDaysFromNow
    ).length;
    const calibrationDue = toolsDue + glasswareDue;

    // Count pending tasks
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;

    // Count completed training
    const completedTraining = training.filter(t => t.result === 'passed').length;

    return {
      overdueCount,
      calibrationDue,
      pendingTasks,
      completedTraining
    };
  }
}

export const storage = new MemStorage();
