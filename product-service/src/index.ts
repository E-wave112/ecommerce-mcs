import express from "express";
import connectDB from "./config/db";
import logger from "./config/logger";
import seedProducts from "./seed/product.seed";
import productRoutes from "./routes/product.routes";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "product-service" });
});

app.use("/products", productRoutes);

const start = async (): Promise<void> => {
  await connectDB();
  await seedProducts();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

start();
