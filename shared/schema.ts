import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tools
export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  serialNumber: text("serial_number"),
  range: text("range"),
  location: text("location").notNull(),
  lastCalibration: timestamp("last_calibration"),
  nextCalibration: timestamp("next_calibration"),
  calibrationStatus: text("calibration_status"), // "passed", "failed", "overdue", "upcoming"
  calibrationResult: text("calibration_result"), // "ผ่าน", "ไม่ผ่าน", "ปรับเทียบ"
  calibrationCertificate: text("calibration_certificate"), // เลขที่ใบรับรอง
  calibrationBy: text("calibration_by"), // ผู้ทำการสอบเทียบ
  calibrationMethod: text("calibration_method"), // วิธีการสอบเทียบ
  calibrationRemarks: text("calibration_remarks"), // หมายเหตุผลการสอบเทียบ
  responsible: text("responsible"),
  notes: text("notes"),
  status: text("status").default("active"), // "active", "repair", "retired"
  repairDate: timestamp("repair_date"), // วันที่ส่งซ่อม
  expectedReturnDate: timestamp("expected_return_date"), // วันที่คาดว่าจะได้รับคืน
  repairRemarks: text("repair_remarks"), // หมายเหตุการซ่อม
});

// Glassware
export const glassware = pgTable("glassware", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  lotNumber: text("lot_number"),
  type: text("type").notNull(),
  class: text("class"),
  brand: text("brand"),
  receivedDate: timestamp("received_date"),
  location: text("location").notNull(),
  lastCalibration: timestamp("last_calibration"),
  nextCalibration: timestamp("next_calibration"),
  calibrationStatus: text("calibration_status"),
  calibrationResult: text("calibration_result"), // "ผ่าน", "ไม่ผ่าน", "ปรับเทียบ"
  calibrationCertificate: text("calibration_certificate"), // เลขที่ใบรับรอง
  calibrationBy: text("calibration_by"), // ผู้ทำการสอบเทียบ
  calibrationMethod: text("calibration_method"), // วิธีการสอบเทียบ
  calibrationRemarks: text("calibration_remarks"), // หมายเหตุผลการสอบเทียบ
  responsible: text("responsible"),
  notes: text("notes"),
});

// Chemicals
export const chemicals = pgTable("chemicals", {
  id: serial("id").primaryKey(),
  chemicalNo: text("chemical_no").notNull().unique(),
  code: text("code"),
  casNo: text("cas_no"),
  name: text("name").notNull(),
  brand: text("brand"),
  grade: text("grade"),
  packageSize: text("package_size"),
  lotNumber: text("lot_number"),
  molecularFormula: text("molecular_formula"),
  molecularWeight: text("molecular_weight"),
  receivedDate: timestamp("received_date"),
  expiryDate: timestamp("expiry_date"),
  location: text("location").notNull(),
  category: text("category").notNull(), // "qa", "standard", "rd"
  notes: text("notes"),
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  sequence: text("sequence"),
  title: text("title").notNull(),
  documentCode: text("document_code").notNull().unique(),
  effectiveDate: timestamp("effective_date"),
  revision: integer("revision").default(0),
  category: text("category").notNull(), // "quality_manual", "procedures", "work_manual", "forms", "support", "announcements"
  filePath: text("file_path"),
  notes: text("notes"),
});

// Training
export const training = pgTable("training", {
  id: serial("id").primaryKey(),
  sequence: text("sequence"),
  course: text("course").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  assessmentLevel: integer("assessment_level"), // 1, 2, 3
  result: text("result"), // "passed", "failed"
  trainee: text("trainee").notNull(),
  acknowledgedDate: timestamp("acknowledged_date"),
  trainer: text("trainer"),
  signedDate: timestamp("signed_date"),
  notes: text("notes"),
});

// MSDS
export const msds = pgTable("msds", {
  id: serial("id").primaryKey(),
  sequence: text("sequence"),
  title: text("title").notNull(),
  documentCode: text("document_code").notNull().unique(),
  effectiveDate: timestamp("effective_date"),
  revision: integer("revision").default(0),
  category: text("category").notNull(), // "sds_lab", "sds_product", "sds_rm"
  filePath: text("file_path"),
  notes: text("notes"),
});

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  responsible: text("responsible").notNull(),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  status: text("status").default("pending"), // "pending", "in_progress", "completed", "cancelled"
  priority: text("priority").default("medium"), // "low", "medium", "high"
  progress: integer("progress").default(0),
  subtasks: json("subtasks"), // Array of subtask objects
});

// Tool Calibration History
export const toolCalibrationHistory = pgTable("tool_calibration_history", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id").notNull(),
  calibrationDate: timestamp("calibration_date").notNull(),
  result: text("result").notNull(), // "ผ่าน", "ไม่ผ่าน"
  certificateNumber: text("certificate_number"),
  calibratedBy: text("calibrated_by"),
  method: text("method"),
  remarks: text("remarks"),
  nextCalibrationDate: timestamp("next_calibration_date"),
});

// Glassware Calibration History
export const glasswareCalibrationHistory = pgTable("glassware_calibration_history", {
  id: serial("id").primaryKey(),
  glasswareId: integer("glassware_id").notNull(),
  calibrationDate: timestamp("calibration_date").notNull(),
  result: text("result").notNull(), // "ผ่าน", "ไม่ผ่าน"
  certificateNumber: text("certificate_number"),
  calibratedBy: text("calibrated_by"),
  method: text("method"),
  remarks: text("remarks"),
  nextCalibrationDate: timestamp("next_calibration_date"),
});

// QA Samples
export const qaSamples = pgTable("qa_samples", {
  id: serial("id").primaryKey(),
  requestNo: text("request_no").notNull().unique(),
  receivedTime: text("received_time").notNull(),
  receivedDate: timestamp("received_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  quotationNo: text("quotation_no"),
  contactPerson: text("contact_person").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  companyName: text("company_name").notNull(),
  address: text("address"),
  deliveryMethod: text("delivery_method").notNull(),
  samples: json("samples"), // Array of sample objects
  storage: text("storage").notNull(), // "room_temp", "chilled", "frozen"
  postTesting: text("post_testing").notNull(), // "return", "dispose"
  condition: text("condition").notNull(), // "normal", "abnormal"
  status: text("status").default("received"), // "received", "testing", "completed", "delivered"
});

// QA Test Results
export const qaTestResults = pgTable("qa_test_results", {
  id: serial("id").primaryKey(),
  sampleNo: text("sample_no").notNull(),
  requestNo: text("request_no").notNull(),
  product: text("product").notNull(),
  dueDate: timestamp("due_date").notNull(),
  testItems: json("test_items"), // Array of test item objects with results
  recordDate: timestamp("record_date").notNull(),
  status: text("status").default("pending"), // "pending", "in_progress", "completed"
  notes: text("notes"),
});

// Insert schemas with custom transformations for timestamps
export const insertToolSchema = createInsertSchema(tools).omit({ id: true }).extend({
  lastCalibration: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  nextCalibration: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  repairDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  expectedReturnDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});
export const insertToolCalibrationHistorySchema = createInsertSchema(toolCalibrationHistory).omit({ id: true }).extend({
  calibrationDate: z.union([z.date(), z.string().datetime()]).transform(val => new Date(val)),
  nextCalibrationDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});
export const insertGlasswareSchema = createInsertSchema(glassware).omit({ id: true }).extend({
  receivedDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  lastCalibration: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  nextCalibration: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});
export const insertGlasswareCalibrationHistorySchema = createInsertSchema(glasswareCalibrationHistory).omit({ id: true }).extend({
  calibrationDate: z.union([z.date(), z.string().datetime()]).transform(val => new Date(val)),
  nextCalibrationDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});
export const insertChemicalSchema = createInsertSchema(chemicals).omit({ id: true }).extend({
  receivedDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  expiryDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true }).extend({
  effectiveDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});
export const insertTrainingSchema = createInsertSchema(training).omit({ id: true }).extend({
  startDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  endDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  acknowledgedDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  signedDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});
export const insertMsdsSchema = createInsertSchema(msds).omit({ id: true }).extend({
  effectiveDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true }).extend({
  startDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  dueDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});
export const insertQaSampleSchema = createInsertSchema(qaSamples).omit({ id: true }).extend({
  receivedDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  dueDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});
export const insertQaTestResultSchema = createInsertSchema(qaTestResults).omit({ id: true }).extend({
  dueDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
  recordDate: z.union([z.date(), z.string().datetime(), z.null()]).transform(val => val ? new Date(val) : null),
});



// Types
export type Tool = typeof tools.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type ToolCalibrationHistory = typeof toolCalibrationHistory.$inferSelect;
export type InsertToolCalibrationHistory = z.infer<typeof insertToolCalibrationHistorySchema>;
export type Glassware = typeof glassware.$inferSelect;
export type InsertGlassware = z.infer<typeof insertGlasswareSchema>;
export type GlasswareCalibrationHistory = typeof glasswareCalibrationHistory.$inferSelect;
export type InsertGlasswareCalibrationHistory = z.infer<typeof insertGlasswareCalibrationHistorySchema>;
export type Chemical = typeof chemicals.$inferSelect;
export type InsertChemical = z.infer<typeof insertChemicalSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Training = typeof training.$inferSelect;
export type InsertTraining = z.infer<typeof insertTrainingSchema>;
export type Msds = typeof msds.$inferSelect;
export type InsertMsds = z.infer<typeof insertMsdsSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type QaSample = typeof qaSamples.$inferSelect;
export type InsertQaSample = z.infer<typeof insertQaSampleSchema>;
export type QaTestResult = typeof qaTestResults.$inferSelect;
export type InsertQaTestResult = z.infer<typeof insertQaTestResultSchema>;
