import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

// Mock connectDB so importing index.ts doesn't hit real Mongo
jest.mock("../src/config/db", () => jest.fn());

import { app } from "../src/index";
import { Order } from "../src/models/order.model";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
}, 30_000);

afterEach(async () => {
  await mongoose.connection.dropDatabase();
  jest.restoreAllMocks();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("Order Service", () => {
  describe("GET /health", () => {
    it("returns 200 with service status", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok", service: "order-service" });
    });
  });

  describe("POST /orders", () => {
    it("returns 201 with order details", async () => {
      // Mock fetch to payment service
      jest.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ message: "Payment processed" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );

      const res = await request(app).post("/orders").send({
        customerId: "cust123",
        productId: "prod456",
        amount: 29.99,
      });

      expect(res.status).toBe(201);
      expect(res.body.customerId).toBe("cust123");
      expect(res.body.productId).toBe("prod456");
      expect(res.body.orderStatus).toBe("pending");
      expect(res.body.orderId).toBeDefined();
    });

    it("returns 400 when missing required fields", async () => {
      const res = await request(app).post("/orders").send({
        customerId: "cust123",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/required/);
    });
  });

  describe("GET /orders", () => {
    it("returns 200 with an array", async () => {
      const res = await request(app).get("/orders");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /orders/:id", () => {
    it("returns 200 with the order", async () => {
      const order = await Order.create({
        customerId: "cust123",
        productId: "prod456",
        amount: 19.99,
        orderStatus: "pending",
      });

      const res = await request(app).get(`/orders/${order._id}`);
      expect(res.status).toBe(200);
      expect(res.body.customerId).toBe("cust123");
    });

    it("returns 404 for non-existent ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/orders/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Order not found");
    });
  });
});
