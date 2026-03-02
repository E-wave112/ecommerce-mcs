import express from "express";
import connectDB from "./config/db";
import logger from "./config/logger";
import orderRoutes from "./routes/order.routes";

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "order-service" });
});

app.use("/orders", orderRoutes);

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

start();
