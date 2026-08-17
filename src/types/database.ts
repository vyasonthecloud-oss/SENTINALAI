export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export type RoleType = `${Role}`;

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export type PaymentStatusType = `${PaymentStatus}`;

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export type OrderStatusType = `${OrderStatus}`;

export interface OrderItemSnapshot {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  sku: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}
