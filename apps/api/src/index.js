import express from "express";
import teacherRoutes from "./routes/teacherRoutes.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import User from "./models/User.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import { connectDB } from "./config/db.js";
import roomsRouter from "./routes/roomRoutes.js";
import exhibitRoutes from "./routes/exhibitRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
});


if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
  throw new Error("Set AUTH_SECRET to a random value of at least 32 characters.");
}
if (!process.env.APP_URL) throw new Error("APP_URL is required.");
const appOrigin = new URL(process.env.APP_URL);
if (process.env.NODE_ENV === "production" && appOrigin.protocol !== "https:") {
  throw new Error("Production APP_URL must use HTTPS.");
}
const app = express();
app.disable("x-powered-by");

app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);

app.use("/api/rooms", roomsRouter);
app.use("/api/exhibits", exhibitRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (_request, response) => {
  const isConnected = mongoose.connection.readyState === 1;

  response.status(isConnected ? 200 : 503).json({
    status: isConnected ? "ok" : "unavailable",
    project: "Almost",
    database: isConnected ? "connected" : "disconnected",
  });
});

app.use((error, _request, response, _next) => {
  const status = error.status === 400 || error.status === 413 ? error.status : 500;
  console.error("API request failed:", error.name);
  response.status(status).json({ message: status === 500 ? "Something went wrong. Please try again." : "Invalid or oversized request." });
});

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDB();
    await User.init();

    const server = app.listen(port, () => {
      console.log(`Almost API listening on http://localhost:${port}`);
    });

    let isShuttingDown = false;

    function shutdown() {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.log("Shutting down the API...");

      const timeout = setTimeout(() => {
        process.exit(1);
      }, 10000);

      timeout.unref();

      server.close(async () => {
        try {
          await mongoose.disconnect();
          clearTimeout(timeout);
          process.exit(0);
        } catch {
          process.exit(1);
        }
      });
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    server.on("error", () => {
      console.error(
        "HTTP server failed. Check whether the port is in use."
      );
      shutdown();
    });
  } catch (error) {
    console.error("Database connection failed:", {
      name: error.name,
      code: error.code,
      causeCode: error.cause?.code,
      hasMongoUri: Boolean(process.env.MONGODB_URI),
    });

    process.exit(1);
  }
}

startServer();
