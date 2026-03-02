import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/payment_db";

  try {
    await mongoose.connect(mongoUri);
    console.log("Payment Service: Connected to MongoDB");
  } catch (error) {
    console.error("Payment Service: MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
