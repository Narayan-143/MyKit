import mongoose, { Schema, Document, Model } from "mongoose";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/constants/order";

export interface IOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ICustomer {
  name: string;
  mobile: string;
  email: string;
  address: string;
}

export interface IOrderDocument extends Document {
  orderNumber: string;
  customer: ICustomer;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, required: true },
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    address: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: CustomerSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "Pending",
    },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "customer.email": 1 });
OrderSchema.index({ "customer.mobile": 1 });

const Order: Model<IOrderDocument> =
  mongoose.models.Order ||
  mongoose.model<IOrderDocument>("Order", OrderSchema);

export default Order;
