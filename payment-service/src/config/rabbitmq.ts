import amqplib, { type Connection, type Channel } from "amqplib";
import logger from "./logger";

let connection: Connection | null = null;
let channel: Channel | null = null;

const RABBITMQ_URI = process.env.RABBITMQ_URI || "amqp://localhost:5672";

export const connectRabbitMQ = async (): Promise<Channel> => {
  try {
    connection = await amqplib.connect(RABBITMQ_URI);
    channel = await connection.createChannel();
    logger.info("Connected to RabbitMQ");
    return channel;
  } catch (error) {
    logger.error("RabbitMQ connection error", { error });
    process.exit(1);
  }
};

export const getChannel = (): Channel => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized. Call connectRabbitMQ() first.");
  }
  return channel;
};

export const closeRabbitMQ = async (): Promise<void> => {
  if (channel) await channel.close();
  if (connection) await connection.close();
};
