import express from "express";
import connectDB from "./config/db";
import logger from "./config/logger";
import { connectRabbitMQ } from "./config/rabbitmq";
import paymentRoutes from "./routes/payment.routes";
import { startWorker } from "./worker";

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "payment-service" });
});

app.use("/payments", paymentRoutes);

const start = async (): Promise<void> => {
  await connectDB();
  const channel = await connectRabbitMQ();
  await startWorker(channel);
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

start();
