import express from "express";
import connectDB from "./config/db";
import logger from "./config/logger";
import seedCustomer from "./seed/customer.seed";
import customerRoutes from "./routes/customer.routes";

export const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "customer-service" });
});

app.use("/customers", customerRoutes);

const start = async (): Promise<void> => {
  await connectDB();
  await seedCustomer();
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

start();
