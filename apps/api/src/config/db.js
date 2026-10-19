import mongoose from "mongoose";
import { env } from "./env.js";

let connectionPromise;

export function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (!connectionPromise) {
    mongoose.set("strictQuery", true);
    connectionPromise = mongoose
      .connect(env.MONGODB_URI, {
        autoIndex: env.NODE_ENV !== "production",
        serverSelectionTimeoutMS: 10_000,
      })
      .then(() => mongoose.connection)
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

export async function disconnectDatabase() {
  connectionPromise = null;
  await mongoose.disconnect();
}
