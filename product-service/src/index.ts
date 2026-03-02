import express from "express";
import connectDB from "./config/db";
import logger from "./config/logger";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "product-service" });
});

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

start();
