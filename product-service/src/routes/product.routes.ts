import { Router, type Request, type Response } from "express";
import { Product } from "../models/product.model";

const router = Router();

/** GET /products - List all products */
router.get("/", async (_req: Request, res: Response) => {
  const products = await Product.find();
  res.json(products);
});

/** GET /products/:id - Get a product by ID */
router.get("/:id", async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(product);
});

export default router;
