import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2) {
    return mongoose.connection.asPromise();
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "almost",
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connected successfully");

  return mongoose.connection;
}