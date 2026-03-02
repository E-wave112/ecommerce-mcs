import mongoose from "mongoose";
import logger from "./logger";

/** Connects to MongoDB using the MONGO_URI environment variable. Exits the process on failure. */
const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/customer_db";

  try {
    await mongoose.connect(mongoUri);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("MongoDB connection error", { error });
    process.exit(1);
  }
};

export default connectDB;
