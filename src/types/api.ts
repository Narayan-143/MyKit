export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  preparingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}
