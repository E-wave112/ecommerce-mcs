import { Schema, model, type Document } from "mongoose";

/** Represents a customer document in MongoDB. */
export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

export const Customer = model<ICustomer>("Customer", customerSchema);
