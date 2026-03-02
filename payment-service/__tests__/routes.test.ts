import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

// Mock connectDB, RabbitMQ, and worker so importing index.ts doesn't hit real infra
jest.mock("../src/config/db", () => jest.fn());
jest.mock("../src/worker", () => ({ startWorker: jest.fn() }));

const mockChannel = {
  assertQueue: jest.fn().mockResolvedValue({}),
  sendToQueue: jest.fn().mockReturnValue(true),
  prefetch: jest.fn(),
  consume: jest.fn(),
  ack: jest.fn(),
  nack: jest.fn(),
};

jest.mock("../src/config/rabbitmq", () => ({
  connectRabbitMQ: jest.fn().mockResolvedValue(mockChannel),
  getChannel: jest.fn(() => mockChannel),
}));

import { app } from "../src/index";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}, 30_000);

afterEach(async () => {
  await mongoose.connection.dropDatabase();
  jest.clearAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("Payment Service", () => {
  describe("GET /health", () => {
    it("returns 200 with service status", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok", service: "payment-service" });
    });
  });

  describe("POST /payments", () => {
    it("returns 200 and publishes message to queue", async () => {
      const res = await request(app).post("/payments").send({
        customerId: "cust123",
        orderId: "order456",
        productId: "prod789",
        amount: 49.99,
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Payment processed");
      expect(res.body.orderId).toBe("order456");
      expect(mockChannel.assertQueue).toHaveBeenCalledWith("transaction_queue", { durable: true });
      expect(mockChannel.sendToQueue).toHaveBeenCalled();
    });

    it("returns 400 when missing required fields", async () => {
      const res = await request(app).post("/payments").send({
        customerId: "cust123",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/required/);
    });
  });
});
