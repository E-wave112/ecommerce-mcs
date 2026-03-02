import { Product } from "../models/product.model";
import logger from "../config/logger";

const products = [
  {
    name: "Wireless Headphones",
    description: "Noise-cancelling over-ear wireless headphones with 30-hour battery life",
    price: 79.99,
    stock: 150,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard with Cherry MX switches",
    price: 129.99,
    stock: 75,
  },
  {
    name: "USB-C Hub",
    description: "7-in-1 USB-C hub with HDMI, SD card reader, and USB 3.0 ports",
    price: 49.99,
    stock: 200,
  },
];

/** Seeds sample products into the database. Idempotent — skips if products already exist. */
const seedProducts = async (): Promise<void> => {
  const count = await Product.countDocuments();

  if (count > 0) {
    logger.info("Products already seeded, skipping seed");
    return;
  }

  const created = await Product.insertMany(products);
  logger.info(`Seeded ${created.length} products`);
};

export default seedProducts;
