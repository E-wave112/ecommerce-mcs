import { Schema, model, type Document } from "mongoose";

/** Represents an order document in MongoDB. Status defaults to "pending". */
export interface IOrder extends Document {
  customerId: string;
  productId: string;
  amount: number;
  orderStatus: "pending" | "confirmed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    customerId: { type: String, required: true },
    productId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order = model<IOrder>("Order", orderSchema);
