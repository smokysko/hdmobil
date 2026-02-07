export interface TopProduct {
  id: string;
  name: string;
  image_url: string | null;
  quantity_sold: number;
  revenue: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  email: string;
  total: number;
  status: string;
  created_at: string;
  items_count: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingPayments: number;
  averageOrderValue: number;
  ordersThisWeek: number;
  ordersLastWeek: number;
  revenueToday: number;
  revenueYesterday: number;
  ordersByStatus: { status: string; count: number }[];
  recentOrders: RecentOrder[];
  revenueByMonth: { month: string; revenue: number }[];
  salesByCategory: { name: string; value: number }[];
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
  paymentMethodStats: { name: string; count: number; revenue: number }[];
  shippingMethodStats: { name: string; count: number }[];
  newsletterStats: {
    total: number;
    thisMonth: number;
    discountUsed: number;
  };
  reviewStats: {
    pending: number;
    averageRating: number;
    totalReviews: number;
  };
  discountStats: {
    active: number;
    expiringSoon: number;
    totalUsed: number;
  };
  customersByCountry: { country: string; count: number }[];
  pendingOrdersOld: number;
  outOfStockCount: number;
}
