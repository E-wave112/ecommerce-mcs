import { Customer } from "../models/customer.model";
import logger from "../config/logger";

const seedCustomer = async (): Promise<void> => {
  const existingCustomer = await Customer.findOne({ email: "john.doe@example.com" });

  if (existingCustomer) {
    logger.info("Seed customer already exists, skipping seed");
    return;
  }

  const customer = await Customer.create({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1-555-123-4567",
    address: "123 Main Street, Springfield, IL 62701",
  });

  logger.info(`Seeded customer - ${customer.name} (${customer._id})`);
};

export default seedCustomer;
