import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getMongoDatabase } from "./lib/mongodb";
import { createResource, createTrip, dashboardSummary, deleteResource, listResource, loginUser, registerUser, updateResource } from "./routes/operations";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.get("/api/dashboard/summary", dashboardSummary);
  app.post("/api/auth/register", registerUser);
  app.post("/api/auth/login", loginUser);
  app.get("/api/:resource", listResource);
  app.post("/api/:resource", createResource);
  app.post("/api/trips/dispatch", createTrip);
  app.patch("/api/:resource/:id", updateResource);
  app.delete("/api/:resource/:id", deleteResource);

  app.get("/api/health/mongodb", async (_req, res) => {
    try {
      const database = await getMongoDatabase();
      await database.command({ ping: 1 });
      res.json({ connected: true, database: database.databaseName });
    } catch (error) {
      console.error("MongoDB health check failed", error);
      res.status(503).json({ connected: false, database: process.env.MONGODB_DB ?? "transitops" });
    }
  });

  return app;
}
