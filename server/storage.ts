import {
  Tool, InsertTool,
  Glassware, InsertGlassware,
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

  // Glassware
  getGlassware(): Promise<Glassware[]>;
  getGlasswareItem(id: number): Promise<Glassware | undefined>;
  createGlassware(glassware: InsertGlassware): Promise<Glassware>;
  updateGlassware(id: number, glassware: Partial<InsertGlassware>): Promise<Glassware | undefined>;
  deleteGlassware(id: number): Promise<boolean>;

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
  private glassware: Map<number, Glassware> = new Map();
  private chemicals: Map<number, Chemical> = new Map();
  private documents: Map<number, Document> = new Map();
  private training: Map<number, Training> = new Map();
  private msds: Map<number, Msds> = new Map();
  private tasks: Map<number, Task> = new Map();
  private qaSamples: Map<number, QaSample> = new Map();
  private qaTestResults: Map<number, QaTestResult> = new Map();
  private currentId: number = 1;

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
