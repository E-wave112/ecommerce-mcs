import mongoose from "mongoose";
import logger from "./logger";

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/payment_db";

  try {
    await mongoose.connect(mongoUri);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("MongoDB connection error", { error });
    process.exit(1);
  }
};

export default connectDB;
