import type { Channel } from "amqplib";
import { Transaction } from "../models/transaction.model";
import logger from "../config/logger";

const QUEUE_NAME = "transaction_queue";

/** Starts a RabbitMQ consumer that saves incoming transaction messages to MongoDB. */
export const startWorker = async (channel: Channel): Promise<void> => {
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  channel.prefetch(1);

  logger.info(`Worker listening on queue: ${QUEUE_NAME}`);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());

      const transaction = await Transaction.create({
        customerId: data.customerId,
        orderId: data.orderId,
        productId: data.productId,
        amount: data.amount,
      });

      logger.info("Transaction saved to history", {
        transactionId: transaction._id,
        orderId: data.orderId,
      });

      channel.ack(msg);
    } catch (error) {
      logger.error("Failed to process transaction message", { error });
      channel.nack(msg, false, true);
    }
  });
};
