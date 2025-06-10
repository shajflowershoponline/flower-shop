import { Product } from "./product";

export class OrderItems {
  orderItemId: string;
  quantity: string;
  price: string;
  totalAmount: string;
  active: boolean;
  order: Order;
  product: Product;
}

export class Order {
  orderId: string;
  orderCode: string;
  name: string;
  mobileNumber: string;
  email: string;
  paymentMethod: string;
  deliveryAddress: string;
  deliveryAddressLandmark: string;
  deliveryAddressCoordinates: { lat: number; lng: number } = null;
  deliveryFee: string;
  promoCode: string;
  subtotal: string;
  discount: string;
  total: string;
  specialInstructions: string;
  notesToRider: string;
  pendingStateAt: Date;
  cancelledStateAt: Date;
  cancelReason: string;
  additionalReason: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  status: string;
  orderItems: OrderItems[] = [];
}

