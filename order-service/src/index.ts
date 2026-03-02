import express from "express";
import connectDB from "./config/db.js";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "order-service" });
});

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
  });
};

start();
