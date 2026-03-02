import express from "express";
import connectDB from "./config/db";
import logger from "./config/logger";
import { connectRabbitMQ } from "./config/rabbitmq";

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "payment-service" });
});

const start = async (): Promise<void> => {
  await connectDB();
  await connectRabbitMQ();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

start();
