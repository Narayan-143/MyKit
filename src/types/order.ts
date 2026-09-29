import { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/constants/order";

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface CustomerInfo {
  name: string;
  mobile: string;
  email: string;
  address: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  customer: CustomerInfo;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
  paymentMethod: PaymentMethod;
}

export interface OrderTrackingInfo {
  orderNumber: string;
  customer: {
    name: string;
    address: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}
