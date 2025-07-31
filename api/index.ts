import express from "express";
import { registerRoutes } from "../server/routes.ts";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
registerRoutes(app).catch(console.error);

// Export the Express app for Vercel
export default app; 