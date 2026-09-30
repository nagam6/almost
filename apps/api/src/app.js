import express from "express";
import teacherRoutes from "./routes/teacherRoutes.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import mongoose from "mongoose";
import roomsRouter from "./routes/roomRoutes.js";
import exhibitRoutes from "./routes/exhibitRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
  throw new Error(
    "Set AUTH_SECRET to a random value of at least 32 characters.",
  );
}

if (!process.env.APP_URL) {
  throw new Error("APP_URL is required.");
}

const appOrigin = new URL(process.env.APP_URL);

if (
  process.env.NODE_ENV === "production" &&
  appOrigin.protocol !== "https:"
) {
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
  const status =
    error.status === 400 || error.status === 413
      ? error.status
      : 500;

  console.error("API request failed:", error.name);

  response.status(status).json({
    message:
      status === 500
        ? "Something went wrong. Please try again."
        : "Invalid or oversized request.",
  });
});

export default app;