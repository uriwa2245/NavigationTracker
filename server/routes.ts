import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertToolSchema, insertGlasswareSchema, insertChemicalSchema,
  insertDocumentSchema, insertTrainingSchema, insertMsdsSchema,
  insertTaskSchema, insertQaSampleSchema, insertQaTestResultSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Tools
  app.get("/api/tools", async (req, res) => {
    try {
      const tools = await storage.getTools();
      res.json(tools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  app.get("/api/tools/:id", async (req, res) => {
    try {
      const tool = await storage.getTool(parseInt(req.params.id));
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      res.json(tool);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  app.post("/api/tools", async (req, res) => {
    try {
      const result = insertToolSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid tool data", errors: result.error.issues });
      }
      const tool = await storage.createTool(result.data);
      
      // Create initial calibration history record if calibration data exists
      if (tool.lastCalibration && tool.calibrationResult) {
        try {
          console.log('Creating calibration history for tool:', tool.id, tool.calibrationResult);
          await storage.createToolCalibrationHistory({
            toolId: tool.id,
            calibrationDate: tool.lastCalibration,
            result: tool.calibrationResult,
            certificateNumber: tool.calibrationCertificate || null,
            calibratedBy: tool.calibrationBy || null,
            method: tool.calibrationMethod || null,
            remarks: tool.calibrationRemarks || null,
            nextCalibrationDate: tool.nextCalibration || null
          });
          console.log('Calibration history created successfully');
        } catch (error) {
          console.error('Error creating calibration history:', error);
        }
      }
      
      res.status(201).json(tool);
    } catch (error) {
      res.status(500).json({ message: "Failed to create tool" });
    }
  });

  app.patch("/api/tools/:id", async (req, res) => {
    try {
      const previousTool = await storage.getTool(parseInt(req.params.id));
      const tool = await storage.updateTool(parseInt(req.params.id), req.body);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      
      // Create new calibration history record if calibration data changed
      if (tool.lastCalibration && tool.calibrationResult && 
          previousTool && 
          (previousTool.lastCalibration?.getTime() !== tool.lastCalibration.getTime() ||
           previousTool.calibrationResult !== tool.calibrationResult)) {
        await storage.createToolCalibrationHistory({
          toolId: tool.id,
          calibrationDate: tool.lastCalibration,
          result: tool.calibrationResult,
          certificateNumber: tool.calibrationCertificate,
          calibratedBy: tool.calibrationBy,
          method: tool.calibrationMethod,
          remarks: tool.calibrationRemarks,
          nextCalibrationDate: tool.nextCalibration
        });
      }
      
      res.json(tool);
    } catch (error) {
      res.status(500).json({ message: "Failed to update tool" });
    }
  });

  app.delete("/api/tools/:id", async (req, res) => {
    try {
      const success = await storage.deleteTool(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Tool not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tool" });
    }
  });

  // Tool Calibration History
  app.get("/api/tools/:id/calibration-history", async (req, res) => {
    try {
      const history = await storage.getToolCalibrationHistory(parseInt(req.params.id));
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calibration history" });
    }
  });

  // Consolidated Tool Calibration History by Name
  app.get("/api/tools/:id/calibration-history-by-name", async (req, res) => {
    try {
      const tool = await storage.getTool(parseInt(req.params.id));
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      
      const history = await storage.getToolCalibrationHistoryByName(tool.name);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consolidated calibration history" });
    }
  });

  // Glassware Calibration History  
  app.get("/api/glassware/:id/calibration-history", async (req, res) => {
    try {
      const history = await storage.getGlasswareCalibrationHistory(parseInt(req.params.id));
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch calibration history" });
    }
  });

  // Consolidated Glassware Calibration History by Type
  app.get("/api/glassware/:id/calibration-history-by-type", async (req, res) => {
    try {
      const glassware = await storage.getGlassware();
      const targetItem = Array.isArray(glassware) ? glassware.find(g => g.id === parseInt(req.params.id)) : null;
      if (!targetItem) {
        return res.status(404).json({ message: "Glassware not found" });
      }
      
      const history = await storage.getGlasswareCalibrationHistoryByType(targetItem.type);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consolidated calibration history" });
    }
  });

  // Glassware
  app.get("/api/glassware", async (req, res) => {
    try {
      const glassware = await storage.getGlassware();
      res.json(glassware);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch glassware" });
    }
  });

  app.post("/api/glassware", async (req, res) => {
    try {
      const result = insertGlasswareSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid glassware data", errors: result.error.issues });
      }
      const glassware = await storage.createGlassware(result.data);
      
      // Create initial calibration history record if calibration data exists
      if (glassware.lastCalibration && glassware.calibrationResult) {
        await storage.createGlasswareCalibrationHistory({
          glasswareId: glassware.id,
          calibrationDate: glassware.lastCalibration,
          result: glassware.calibrationResult,
          certificateNumber: glassware.calibrationCertificate,
          calibratedBy: glassware.calibrationBy,
          method: glassware.calibrationMethod,
          remarks: glassware.calibrationRemarks,
          nextCalibrationDate: glassware.nextCalibration
        });
      }
      
      res.status(201).json(glassware);
    } catch (error) {
      res.status(500).json({ message: "Failed to create glassware" });
    }
  });

  app.patch("/api/glassware/:id", async (req, res) => {
    try {
      const previousGlassware = await storage.getGlasswareItem(parseInt(req.params.id));
      const glassware = await storage.updateGlassware(parseInt(req.params.id), req.body);
      if (!glassware) {
        return res.status(404).json({ message: "Glassware not found" });
      }
      
      // Create new calibration history record if calibration data changed
      if (glassware.lastCalibration && glassware.calibrationResult && 
          previousGlassware && 
          (previousGlassware.lastCalibration?.getTime() !== glassware.lastCalibration.getTime() ||
           previousGlassware.calibrationResult !== glassware.calibrationResult)) {
        await storage.createGlasswareCalibrationHistory({
          glasswareId: glassware.id,
          calibrationDate: glassware.lastCalibration,
          result: glassware.calibrationResult,
          certificateNumber: glassware.calibrationCertificate,
          calibratedBy: glassware.calibrationBy,
          method: glassware.calibrationMethod,
          remarks: glassware.calibrationRemarks,
          nextCalibrationDate: glassware.nextCalibration
        });
      }
      
      res.json(glassware);
    } catch (error) {
      res.status(500).json({ message: "Failed to update glassware" });
    }
  });

  app.delete("/api/glassware/:id", async (req, res) => {
    try {
      const success = await storage.deleteGlassware(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Glassware not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete glassware" });
    }
  });

  // Chemicals
  app.get("/api/chemicals", async (req, res) => {
    try {
      const { category } = req.query;
      const chemicals = category 
        ? await storage.getChemicalsByCategory(category as string)
        : await storage.getChemicals();
      res.json(chemicals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chemicals" });
    }
  });

  app.post("/api/chemicals", async (req, res) => {
    try {
      const result = insertChemicalSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid chemical data", errors: result.error.issues });
      }
      const chemical = await storage.createChemical(result.data);
      res.status(201).json(chemical);
    } catch (error) {
      res.status(500).json({ message: "Failed to create chemical" });
    }
  });

  app.patch("/api/chemicals/:id", async (req, res) => {
    try {
      const chemical = await storage.updateChemical(parseInt(req.params.id), req.body);
      if (!chemical) {
        return res.status(404).json({ message: "Chemical not found" });
      }
      res.json(chemical);
    } catch (error) {
      res.status(500).json({ message: "Failed to update chemical" });
    }
  });

  app.delete("/api/chemicals/:id", async (req, res) => {
    try {
      const success = await storage.deleteChemical(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Chemical not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete chemical" });
    }
  });

  // Documents
  app.get("/api/documents", async (req, res) => {
    try {
      const { category } = req.query;
      const documents = category 
        ? await storage.getDocumentsByCategory(category as string)
        : await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const result = insertDocumentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid document data", errors: result.error.issues });
      }
      const document = await storage.createDocument(result.data);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.updateDocument(parseInt(req.params.id), req.body);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const success = await storage.deleteDocument(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Training
  app.get("/api/training", async (req, res) => {
    try {
      const training = await storage.getTraining();
      res.json(training);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch training" });
    }
  });

  app.post("/api/training", async (req, res) => {
    try {
      const result = insertTrainingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid training data", errors: result.error.issues });
      }
      const training = await storage.createTraining(result.data);
      res.status(201).json(training);
    } catch (error) {
      res.status(500).json({ message: "Failed to create training" });
    }
  });

  app.patch("/api/training/:id", async (req, res) => {
    try {
      const training = await storage.updateTraining(parseInt(req.params.id), req.body);
      if (!training) {
        return res.status(404).json({ message: "Training not found" });
      }
      res.json(training);
    } catch (error) {
      res.status(500).json({ message: "Failed to update training" });
    }
  });

  app.delete("/api/training/:id", async (req, res) => {
    try {
      const success = await storage.deleteTraining(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Training not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete training" });
    }
  });

  // MSDS
  app.get("/api/msds", async (req, res) => {
    try {
      const { category } = req.query;
      const msds = category 
        ? await storage.getMsdsByCategory(category as string)
        : await storage.getMsds();
      res.json(msds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch MSDS" });
    }
  });

  app.post("/api/msds", async (req, res) => {
    try {
      const result = insertMsdsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid MSDS data", errors: result.error.issues });
      }
      const msds = await storage.createMsds(result.data);
      res.status(201).json(msds);
    } catch (error) {
      res.status(500).json({ message: "Failed to create MSDS" });
    }
  });

  app.patch("/api/msds/:id", async (req, res) => {
    try {
      const msds = await storage.updateMsds(parseInt(req.params.id), req.body);
      if (!msds) {
        return res.status(404).json({ message: "MSDS not found" });
      }
      res.json(msds);
    } catch (error) {
      res.status(500).json({ message: "Failed to update MSDS" });
    }
  });

  app.delete("/api/msds/:id", async (req, res) => {
    try {
      const success = await storage.deleteMsds(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "MSDS not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete MSDS" });
    }
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const result = insertTaskSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid task data", errors: result.error.issues });
      }
      const task = await storage.createTask(result.data);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.updateTask(parseInt(req.params.id), req.body);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const success = await storage.deleteTask(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // QA Samples
  app.get("/api/qa-samples", async (req, res) => {
    try {
      const qaSamples = await storage.getQaSamples();
      res.json(qaSamples);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QA samples" });
    }
  });

  app.post("/api/qa-samples", async (req, res) => {
    try {
      const result = insertQaSampleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid QA sample data", errors: result.error.issues });
      }
      const qaSample = await storage.createQaSample(result.data);
      res.status(201).json(qaSample);
    } catch (error) {
      res.status(500).json({ message: "Failed to create QA sample" });
    }
  });

  app.patch("/api/qa-samples/:id", async (req, res) => {
    try {
      const qaSample = await storage.updateQaSample(parseInt(req.params.id), req.body);
      if (!qaSample) {
        return res.status(404).json({ message: "QA sample not found" });
      }
      res.json(qaSample);
    } catch (error) {
      res.status(500).json({ message: "Failed to update QA sample" });
    }
  });

  app.delete("/api/qa-samples/:id", async (req, res) => {
    try {
      const success = await storage.deleteQaSample(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "QA sample not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete QA sample" });
    }
  });

  // QA Test Results
  app.get("/api/qa-test-results", async (req, res) => {
    try {
      const testResults = await storage.getQaTestResults();
      res.json(testResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch QA test results" });
    }
  });

  app.post("/api/qa-test-results", async (req, res) => {
    try {
      const result = insertQaTestResultSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid QA test result data", errors: result.error.issues });
      }
      const testResult = await storage.createQaTestResult(result.data);
      res.status(201).json(testResult);
    } catch (error) {
      res.status(500).json({ message: "Failed to create QA test result" });
    }
  });

  app.put("/api/qa-test-results/:id", async (req, res) => {
    try {
      const result = insertQaTestResultSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid QA test result data", errors: result.error.issues });
      }
      const testResult = await storage.updateQaTestResult(parseInt(req.params.id), result.data);
      if (!testResult) {
        return res.status(404).json({ message: "QA test result not found" });
      }
      res.json(testResult);
    } catch (error) {
      res.status(500).json({ message: "Failed to update QA test result" });
    }
  });

  app.delete("/api/qa-test-results/:id", async (req, res) => {
    try {
      const success = await storage.deleteQaTestResult(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "QA test result not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete QA test result" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
