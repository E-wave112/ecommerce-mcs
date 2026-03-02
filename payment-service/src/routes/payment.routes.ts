import { Router, type Request, type Response } from "express";
import { getChannel } from "../config/rabbitmq";
import logger from "../config/logger";

const QUEUE_NAME = "transaction_queue";

const router = Router();

/** POST /payments - Process a payment and publish to RabbitMQ */
router.post("/", async (req: Request, res: Response) => {
  const { customerId, orderId, productId, amount } = req.body;

  if (!customerId || !orderId || !productId || !amount) {
    res.status(400).json({ error: "customerId, orderId, productId, and amount are required" });
    return;
  }

  const channel = getChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  const transactionData = { customerId, orderId, productId, amount };

  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(transactionData)), {
    persistent: true,
  });

  logger.info("Transaction published to queue", { orderId, customerId });

  res.status(200).json({ message: "Payment processed", orderId });
});

export default router;
