/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  userName: string;
  rating: number; // 1 to 5 stars
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  category: string;
  reviews?: Review[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Cancelled';
export type OrderSource = 'Website' | 'Telegram' | 'Facebook';

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  customerName: string;
  shippingAddress: string;
  customerEmail?: string;
  source: OrderSource;
  status: OrderStatus;
  createdAt: string;
  paymentDetails?: {
    cardBrand?: string;
    last4?: string;
    transactionId?: string;
  };
}

export interface TelegramConfig {
  token: string;
  chatId: string;
  botUsername: string;
  isActive: boolean;
}

export interface FacebookSimulateRequest {
  commentText: string;
}

export interface FacebookSimulateResult {
  success: boolean;
  rawComment: string;
  parsedData?: {
    customerName: string;
    productName: string;
    quantity: number;
    shippingAddress: string;
    totalPriceEstimate: number;
  };
  orderCreated?: Order;
  error?: string;
}

export interface SSEEvent {
  type: 'products_updated' | 'orders_updated' | 'telegram_status' | 'telegram_message_simulated';
  data: any;
}
