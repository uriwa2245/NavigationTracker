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

interface IStorage {
  // Tools
  getTools(): Promise<Tool[]>;
  getTool(id: number): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool | undefined>;
  deleteTool(id: number): Promise<boolean>;

  // Tool Calibration History
  getToolCalibrationHistory(toolId: number): Promise<ToolCalibrationHistory[]>;
  getToolCalibrationHistoryByName(toolName: string): Promise<ToolCalibrationHistory[]>;
  createToolCalibrationHistory(history: InsertToolCalibrationHistory): Promise<ToolCalibrationHistory>;

  // Glassware
  getGlassware(): Promise<Glassware[]>;
  getGlasswareItem(id: number): Promise<Glassware | undefined>;
  createGlassware(glassware: InsertGlassware): Promise<Glassware>;
  updateGlassware(id: number, glassware: Partial<InsertGlassware>): Promise<Glassware | undefined>;
  deleteGlassware(id: number): Promise<boolean>;

  // Glassware Calibration History
  getGlasswareCalibrationHistory(glasswareId: number): Promise<GlasswareCalibrationHistory[]>;
  getGlasswareCalibrationHistoryByType(glasswareType: string): Promise<GlasswareCalibrationHistory[]>;
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
  createQaSample(sample: InsertQaSample): Promise<QaSample>;
  updateQaSample(id: number, sample: Partial<InsertQaSample>): Promise<QaSample | undefined>;
  deleteQaSample(id: number): Promise<boolean>;

  // QA Test Results
  getQaTestResults(): Promise<QaTestResult[]>;
  getQaTestResultsBySample(sampleId: number): Promise<QaTestResult[]>;
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

// LocalStorage Implementation for Client-side Storage
export class LocalStorage implements IStorage {
  private currentId: number = 100;

  constructor() {
    this.currentId = this.getNextId();
  }

  private getNextId(): number {
    const storedId = localStorage.getItem('navigationTracker_nextId');
    return storedId ? parseInt(storedId) : 100;
  }

  private setNextId(id: number): void {
    localStorage.setItem('navigationTracker_nextId', id.toString());
  }

  private getStorageKey(entity: string): string {
    return `navigationTracker_${entity}`;
  }

  private getData<T>(entity: string): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey(entity));
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading ${entity} from localStorage:`, error);
      return [];
    }
  }

  private setData<T>(entity: string, data: T[]): void {
    try {
      localStorage.setItem(this.getStorageKey(entity), JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing ${entity} to localStorage:`, error);
    }
  }

  private generateId(): number {
    const id = this.currentId++;
    this.setNextId(this.currentId);
    return id;
  }

  // QA Samples Implementation
  async getQaSamples(): Promise<QaSample[]> {
    return this.getData<QaSample>('qaSamples');
  }

  async getQaSample(id: number): Promise<QaSample | undefined> {
    const samples = this.getData<QaSample>('qaSamples');
    return samples.find(sample => sample.id === id);
  }

  async createQaSample(sample: InsertQaSample): Promise<QaSample> {
    const samples = this.getData<QaSample>('qaSamples');
    const newSample: QaSample = {
      ...sample,
      id: this.generateId(),
      receivedDate: sample.receivedDate ?? new Date(),
      dueDate: sample.dueDate ?? new Date(),
      quotationNo: sample.quotationNo ?? null,
      contactPerson: sample.contactPerson,
      phone: sample.phone,
      email: sample.email,
      companyName: sample.companyName,
      address: sample.address ?? null,
      deliveryMethod: sample.deliveryMethod,
      samples: sample.samples,
      storage: sample.storage ?? null,
      postTesting: sample.postTesting ?? null,
      condition: sample.condition ?? null,
      status: sample.status ?? "received",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    samples.push(newSample);
    this.setData('qaSamples', samples);
    return newSample;
  }

  async updateQaSample(id: number, sample: Partial<InsertQaSample>): Promise<QaSample | undefined> {
    const samples = this.getData<QaSample>('qaSamples');
    const index = samples.findIndex(s => s.id === id);
    
    if (index === -1) return undefined;
    
    const updatedSample = { 
      ...samples[index], 
      ...sample, 
      updatedAt: new Date() 
    };
    
    samples[index] = updatedSample;
    this.setData('qaSamples', samples);
    return updatedSample;
  }

  async deleteQaSample(id: number): Promise<boolean> {
    const samples = this.getData<QaSample>('qaSamples');
    const filteredSamples = samples.filter(s => s.id !== id);
    
    if (filteredSamples.length === samples.length) {
      return false; // No item was deleted
    }
    
    this.setData('qaSamples', filteredSamples);
    return true;
  }

  // Placeholder implementations for other methods
  async getTools(): Promise<Tool[]> { return []; }
  async getTool(id: number): Promise<Tool | undefined> { return undefined; }
  async createTool(tool: InsertTool): Promise<Tool> { throw new Error('Not implemented'); }
  async updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool | undefined> { return undefined; }
  async deleteTool(id: number): Promise<boolean> { return false; }
  async getToolCalibrationHistory(toolId: number): Promise<ToolCalibrationHistory[]> { return []; }
  async getToolCalibrationHistoryByName(toolName: string): Promise<ToolCalibrationHistory[]> { return []; }
  async createToolCalibrationHistory(history: InsertToolCalibrationHistory): Promise<ToolCalibrationHistory> { throw new Error('Not implemented'); }
  async getGlassware(): Promise<Glassware[]> { return []; }
  async getGlasswareItem(id: number): Promise<Glassware | undefined> { return undefined; }
  async createGlassware(glassware: InsertGlassware): Promise<Glassware> { throw new Error('Not implemented'); }
  async updateGlassware(id: number, glassware: Partial<InsertGlassware>): Promise<Glassware | undefined> { return undefined; }
  async deleteGlassware(id: number): Promise<boolean> { return false; }
  async getGlasswareCalibrationHistory(glasswareId: number): Promise<GlasswareCalibrationHistory[]> { return []; }
  async getGlasswareCalibrationHistoryByType(glasswareType: string): Promise<GlasswareCalibrationHistory[]> { return []; }
  async createGlasswareCalibrationHistory(history: InsertGlasswareCalibrationHistory): Promise<GlasswareCalibrationHistory> { throw new Error('Not implemented'); }
  async getChemicals(): Promise<Chemical[]> { return []; }
  async getChemicalsByCategory(category: string): Promise<Chemical[]> { return []; }
  async getChemical(id: number): Promise<Chemical | undefined> { return undefined; }
  async createChemical(chemical: InsertChemical): Promise<Chemical> { throw new Error('Not implemented'); }
  async updateChemical(id: number, chemical: Partial<InsertChemical>): Promise<Chemical | undefined> { return undefined; }
  async deleteChemical(id: number): Promise<boolean> { return false; }
  async getDocuments(): Promise<Document[]> { return []; }
  async getDocumentsByCategory(category: string): Promise<Document[]> { return []; }
  async getDocument(id: number): Promise<Document | undefined> { return undefined; }
  async createDocument(document: InsertDocument): Promise<Document> { throw new Error('Not implemented'); }
  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined> { return undefined; }
  async deleteDocument(id: number): Promise<boolean> { return false; }
  async getTraining(): Promise<Training[]> { return []; }
  async getTrainingItem(id: number): Promise<Training | undefined> { return undefined; }
  async createTraining(training: InsertTraining): Promise<Training> { throw new Error('Not implemented'); }
  async updateTraining(id: number, training: Partial<InsertTraining>): Promise<Training | undefined> { return undefined; }
  async deleteTraining(id: number): Promise<boolean> { return false; }
  async getMsds(): Promise<Msds[]> { return []; }
  async getMsdsByCategory(category: string): Promise<Msds[]> { return []; }
  async getMsdsItem(id: number): Promise<Msds | undefined> { return undefined; }
  async createMsds(msds: InsertMsds): Promise<Msds> { throw new Error('Not implemented'); }
  async updateMsds(id: number, msds: Partial<InsertMsds>): Promise<Msds | undefined> { return undefined; }
  async deleteMsds(id: number): Promise<boolean> { return false; }
  async getTasks(): Promise<Task[]> { return []; }
  async getTask(id: number): Promise<Task | undefined> { return undefined; }
  async createTask(task: InsertTask): Promise<Task> { throw new Error('Not implemented'); }
  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> { return undefined; }
  async deleteTask(id: number): Promise<boolean> { return false; }
  async getQaTestResults(): Promise<QaTestResult[]> { return []; }
  async getQaTestResultsBySample(sampleId: number): Promise<QaTestResult[]> { return []; }
  async getQaTestResult(id: number): Promise<QaTestResult | undefined> { return undefined; }
  async createQaTestResult(testResult: InsertQaTestResult): Promise<QaTestResult> { throw new Error('Not implemented'); }
  async updateQaTestResult(id: number, testResult: InsertQaTestResult): Promise<QaTestResult | undefined> { return undefined; }
  async deleteQaTestResult(id: number): Promise<boolean> { return false; }
  async getDashboardStats(): Promise<{ overdueCount: number; calibrationDue: number; pendingTasks: number; completedTraining: number; }> {
    return { overdueCount: 0, calibrationDue: 0, pendingTasks: 0, completedTraining: 0 };
  }
}

// In-Memory Storage Implementation for Development
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
    this.currentId = 100;
  }

  // QA Samples Implementation
  async getQaSamples(): Promise<QaSample[]> {
    return Array.from(this.qaSamples.values());
  }

  async getQaSample(id: number): Promise<QaSample | undefined> {
    return this.qaSamples.get(id);
  }

  async createQaSample(sample: InsertQaSample): Promise<QaSample> {
    const id = this.currentId++;
    const newSample: QaSample = { 
      ...sample, 
      id,
      receivedDate: sample.receivedDate ?? new Date(),
      dueDate: sample.dueDate ?? new Date(),
      quotationNo: sample.quotationNo ?? null,
      contactPerson: sample.contactPerson,
      phone: sample.phone,
      email: sample.email,
      companyName: sample.companyName,
      address: sample.address ?? null,
      deliveryMethod: sample.deliveryMethod,
      samples: sample.samples,
      storage: sample.storage ?? null,
      postTesting: sample.postTesting ?? null,
      condition: sample.condition ?? null,
      status: sample.status ?? "received",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.qaSamples.set(id, newSample);
    return newSample;
  }

  async updateQaSample(id: number, sample: Partial<InsertQaSample>): Promise<QaSample | undefined> {
    const existingSample = this.qaSamples.get(id);
    if (!existingSample) return undefined;
    
    const updatedSample = { ...existingSample, ...sample, updatedAt: new Date() };
    this.qaSamples.set(id, updatedSample);
    return updatedSample;
  }

  async deleteQaSample(id: number): Promise<boolean> {
    return this.qaSamples.delete(id);
  }

  // Placeholder implementations for other methods
  async getTools(): Promise<Tool[]> { return []; }
  async getTool(id: number): Promise<Tool | undefined> { return undefined; }
  async createTool(tool: InsertTool): Promise<Tool> { throw new Error('Not implemented'); }
  async updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool | undefined> { return undefined; }
  async deleteTool(id: number): Promise<boolean> { return false; }
  async getToolCalibrationHistory(toolId: number): Promise<ToolCalibrationHistory[]> { return []; }
  async getToolCalibrationHistoryByName(toolName: string): Promise<ToolCalibrationHistory[]> { return []; }
  async createToolCalibrationHistory(history: InsertToolCalibrationHistory): Promise<ToolCalibrationHistory> { throw new Error('Not implemented'); }
  async getGlassware(): Promise<Glassware[]> { return []; }
  async getGlasswareItem(id: number): Promise<Glassware | undefined> { return undefined; }
  async createGlassware(glassware: InsertGlassware): Promise<Glassware> { throw new Error('Not implemented'); }
  async updateGlassware(id: number, glassware: Partial<InsertGlassware>): Promise<Glassware | undefined> { return undefined; }
  async deleteGlassware(id: number): Promise<boolean> { return false; }
  async getGlasswareCalibrationHistory(glasswareId: number): Promise<GlasswareCalibrationHistory[]> { return []; }
  async getGlasswareCalibrationHistoryByType(glasswareType: string): Promise<GlasswareCalibrationHistory[]> { return []; }
  async createGlasswareCalibrationHistory(history: InsertGlasswareCalibrationHistory): Promise<GlasswareCalibrationHistory> { throw new Error('Not implemented'); }
  async getChemicals(): Promise<Chemical[]> { return []; }
  async getChemicalsByCategory(category: string): Promise<Chemical[]> { return []; }
  async getChemical(id: number): Promise<Chemical | undefined> { return undefined; }
  async createChemical(chemical: InsertChemical): Promise<Chemical> { throw new Error('Not implemented'); }
  async updateChemical(id: number, chemical: Partial<InsertChemical>): Promise<Chemical | undefined> { return undefined; }
  async deleteChemical(id: number): Promise<boolean> { return false; }
  async getDocuments(): Promise<Document[]> { return []; }
  async getDocumentsByCategory(category: string): Promise<Document[]> { return []; }
  async getDocument(id: number): Promise<Document | undefined> { return undefined; }
  async createDocument(document: InsertDocument): Promise<Document> { throw new Error('Not implemented'); }
  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined> { return undefined; }
  async deleteDocument(id: number): Promise<boolean> { return false; }
  async getTraining(): Promise<Training[]> { return []; }
  async getTrainingItem(id: number): Promise<Training | undefined> { return undefined; }
  async createTraining(training: InsertTraining): Promise<Training> { throw new Error('Not implemented'); }
  async updateTraining(id: number, training: Partial<InsertTraining>): Promise<Training | undefined> { return undefined; }
  async deleteTraining(id: number): Promise<boolean> { return false; }
  async getMsds(): Promise<Msds[]> { return []; }
  async getMsdsByCategory(category: string): Promise<Msds[]> { return []; }
  async getMsdsItem(id: number): Promise<Msds | undefined> { return undefined; }
  async createMsds(msds: InsertMsds): Promise<Msds> { throw new Error('Not implemented'); }
  async updateMsds(id: number, msds: Partial<InsertMsds>): Promise<Msds | undefined> { return undefined; }
  async deleteMsds(id: number): Promise<boolean> { return false; }
  async getTasks(): Promise<Task[]> { return []; }
  async getTask(id: number): Promise<Task | undefined> { return undefined; }
  async createTask(task: InsertTask): Promise<Task> { throw new Error('Not implemented'); }
  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> { return undefined; }
  async deleteTask(id: number): Promise<boolean> { return false; }
  async getQaTestResults(): Promise<QaTestResult[]> { return []; }
  async getQaTestResultsBySample(sampleId: number): Promise<QaTestResult[]> { return []; }
  async getQaTestResult(id: number): Promise<QaTestResult | undefined> { return undefined; }
  async createQaTestResult(testResult: InsertQaTestResult): Promise<QaTestResult> { throw new Error('Not implemented'); }
  async updateQaTestResult(id: number, testResult: InsertQaTestResult): Promise<QaTestResult | undefined> { return undefined; }
  async deleteQaTestResult(id: number): Promise<boolean> { return false; }
  async getDashboardStats(): Promise<{ overdueCount: number; calibrationDue: number; pendingTasks: number; completedTraining: number; }> {
    return { overdueCount: 0, calibrationDue: 0, pendingTasks: 0, completedTraining: 0 };
  }
}

// Storage factory function
export function createStorage(): IStorage {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return new LocalStorage();
  }
  return new MemStorage();
}

const storage = createStorage();
export { storage };
export { IStorage };