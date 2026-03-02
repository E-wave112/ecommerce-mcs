import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

// Mock connectDB and seedProducts so importing index.ts doesn't hit real Mongo
jest.mock("../src/config/db", () => jest.fn());
jest.mock("../src/seed/product.seed", () => jest.fn());

import { app } from "../src/index";
import { Product } from "../src/models/product.model";

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

describe("Product Service", () => {
  describe("GET /health", () => {
    it("returns 200 with service status", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok", service: "product-service" });
    });
  });

  describe("GET /products", () => {
    it("returns 200 with an array", async () => {
      const res = await request(app).get("/products");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /products/:id", () => {
    it("returns 200 with a seeded product", async () => {
      const product = await Product.create({
        name: "Test Widget",
        description: "A widget for testing",
        price: 9.99,
        stock: 50,
      });

      const res = await request(app).get(`/products/${product._id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Test Widget");
      expect(res.body.price).toBe(9.99);
    });

    it("returns 404 for non-existent ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/products/${fakeId}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Product not found");
    });
  });
});
