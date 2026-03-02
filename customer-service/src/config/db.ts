import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/customer_db";

  try {
    await mongoose.connect(mongoUri);
    console.log("Customer Service: Connected to MongoDB");
  } catch (error) {
    console.error("Customer Service: MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
