import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import { connectDB } from "./config/db.js";
import roomsRouter from "./routes/roomRoutes.js";
import exhibitRoutes from "./routes/exhibitRoutes.js";

dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url)),
});


const app = express();

app.use(express.json());

app.use("/api/rooms", roomsRouter);
app.use("/api/exhibits", exhibitRoutes);

app.get("/api/health", (_request, response) => {
  const isConnected = mongoose.connection.readyState === 1;

  response.status(isConnected ? 200 : 503).json({
    status: isConnected ? "ok" : "unavailable",
    project: "Almost",
    database: isConnected ? "connected" : "disconnected",
  });
});

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDB();

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