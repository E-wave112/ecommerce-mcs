import { Router, type Request, type Response } from "express";
import { Order } from "../models/order.model";
import logger from "../config/logger";

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || "http://localhost:3004";

const router = Router();

/** POST /orders - Create a new order */
router.post("/", async (req: Request, res: Response) => {
  const { customerId, productId, amount } = req.body;

  if (!customerId || !productId || !amount) {
    res.status(400).json({ error: "customerId, productId, and amount are required" });
    return;
  }

  // Save order with pending status
  const order = await Order.create({
    customerId,
    productId,
    amount,
    orderStatus: "pending",
  });

  logger.info(`Order created: ${order._id}`, { orderId: order._id, customerId, productId });

  // Send payment request to payment service
  try {
    const paymentResponse = await fetch(`${PAYMENT_SERVICE_URL}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        orderId: order._id,
        amount,
      }),
    });

    if (!paymentResponse.ok) {
      logger.error("Payment service returned an error", {
        status: paymentResponse.status,
        orderId: order._id,
      });
    }
  } catch (error) {
    logger.error("Failed to reach payment service", { error, orderId: order._id });
  }

  // Return order details to customer
  res.status(201).json({
    customerId: order.customerId,
    orderId: order._id,
    productId: order.productId,
    orderStatus: order.orderStatus,
  });
});

/** GET /orders - List all orders */
router.get("/", async (_req: Request, res: Response) => {
  const orders = await Order.find();
  res.json(orders);
});

/** GET /orders/:id - Get an order by ID */
router.get("/:id", async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(order);
});

export default router;
