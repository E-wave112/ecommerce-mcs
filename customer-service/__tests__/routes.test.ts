import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

// Mock connectDB and seedCustomer so importing index.ts doesn't hit real Mongo
jest.mock("../src/config/db", () => jest.fn());
jest.mock("../src/seed/customer.seed", () => jest.fn());

import { app } from "../src/index";
import { Customer } from "../src/models/customer.model";

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

describe("Customer Service", () => {
  describe("GET /health", () => {
    it("returns 200 with service status", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok", service: "customer-service" });
    });
  });

  describe("GET /customers", () => {
    it("returns 200 with an array", async () => {
      const res = await request(app).get("/customers");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /customers/:id", () => {
    it("returns 200 with the seeded customer", async () => {
      const customer = await Customer.create({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+1-555-000-0000",
        address: "456 Oak Ave",
      });

      const res = await request(app).get(`/customers/${customer._id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Jane Doe");
      expect(res.body.email).toBe("jane@example.com");
    });

    it("returns 404 for non-existent ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/customers/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Customer not found");
    });
  });
});
