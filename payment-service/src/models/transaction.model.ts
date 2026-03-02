import { Schema, model, type Document } from "mongoose";

/** Represents a transaction record in MongoDB, saved by the RabbitMQ worker. */
export interface ITransaction extends Document {
  customerId: string;
  orderId: string;
  productId: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    customerId: { type: String, required: true },
    orderId: { type: String, required: true },
    productId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Transaction = model<ITransaction>("Transaction", transactionSchema);
