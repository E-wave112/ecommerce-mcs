import { Router, type Request, type Response } from "express";
import { Customer } from "../models/customer.model";

const router = Router();

/** GET /customers - List all customers */
router.get("/", async (_req: Request, res: Response) => {
  const customers = await Customer.find();
  res.json(customers);
});

/** GET /customers/:id - Get a customer by ID */
router.get("/:id", async (req: Request, res: Response) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  res.json(customer);
});

export default router;
