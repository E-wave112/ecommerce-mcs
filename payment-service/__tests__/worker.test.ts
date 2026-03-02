import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import type { Channel, ConsumeMessage } from "amqplib";

// Mock connectDB and RabbitMQ so module loading doesn't hit real infra
jest.mock("../src/config/db", () => jest.fn());
jest.mock("../src/config/rabbitmq", () => ({
  connectRabbitMQ: jest.fn(),
  getChannel: jest.fn(),
}));

import { startWorker } from "../src/worker";
import { Transaction } from "../src/models/transaction.model";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}, 30_000);

afterEach(async () => {
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("Payment Worker", () => {
  it("processes a valid message and saves a Transaction", async () => {
    let consumeCallback: (msg: ConsumeMessage | null) => void = () => {};

    const mockChannel = {
      assertQueue: jest.fn().mockResolvedValue({}),
      prefetch: jest.fn(),
      consume: jest.fn((_queue: string, cb: (msg: ConsumeMessage | null) => void) => {
        consumeCallback = cb;
      }),
      ack: jest.fn(),
      nack: jest.fn(),
    } as unknown as Channel;

    await startWorker(mockChannel);

    expect(mockChannel.assertQueue).toHaveBeenCalledWith("transaction_queue", { durable: true });
    expect(mockChannel.prefetch).toHaveBeenCalledWith(1);
    expect(mockChannel.consume).toHaveBeenCalled();

    // Simulate a valid message
    const validData = {
      customerId: "cust123",
      orderId: "order456",
      productId: "prod789",
      amount: 29.99,
    };

    const fakeMsg = {
      content: Buffer.from(JSON.stringify(validData)),
    } as ConsumeMessage;

    await consumeCallback(fakeMsg);

    const transactions = await Transaction.find();
    expect(transactions).toHaveLength(1);
    expect(transactions[0].customerId).toBe("cust123");
    expect(transactions[0].orderId).toBe("order456");
    expect(transactions[0].amount).toBe(29.99);
    expect(mockChannel.ack).toHaveBeenCalledWith(fakeMsg);
  });

  it("handles invalid message by nacking and requeuing", async () => {
    let consumeCallback: (msg: ConsumeMessage | null) => void = () => {};

    const mockChannel = {
      assertQueue: jest.fn().mockResolvedValue({}),
      prefetch: jest.fn(),
      consume: jest.fn((_queue: string, cb: (msg: ConsumeMessage | null) => void) => {
        consumeCallback = cb;
      }),
      ack: jest.fn(),
      nack: jest.fn(),
    } as unknown as Channel;

    await startWorker(mockChannel);

    // Simulate an invalid message (bad JSON)
    const badMsg = {
      content: Buffer.from("not valid json{{{"),
    } as ConsumeMessage;

    await consumeCallback(badMsg);

    const transactions = await Transaction.find();
    expect(transactions).toHaveLength(0);
    expect(mockChannel.nack).toHaveBeenCalledWith(badMsg, false, true);
  });
});
