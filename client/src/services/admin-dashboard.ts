import { supabase } from "@/lib/supabase";
import type { DashboardStats } from "@/types/dashboard";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();
  const yesterdayStart = new Date(
    new Date(todayStart).getTime() - 86400000
  ).toISOString();
  const weekStart = new Date(
    new Date(todayStart).getTime() - 7 * 86400000
  ).toISOString();
  const lastWeekStart = new Date(
    new Date(todayStart).getTime() - 14 * 86400000
  ).toISOString();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();
  const twentyFourHoursAgo = new Date(
    now.getTime() - 86400000
  ).toISOString();
  const sevenDaysFromNow = new Date(
    now.getTime() + 7 * 86400000
  ).toISOString();

  const [
    totalOrdersRes,
    customersCountRes,
    pendingPaymentsRes,
    ordersThisWeekRes,
    ordersLastWeekRes,
    pendingOrdersOldRes,
    outOfStockRes,
    ordersRes,
    recentOrdersRes,
    lowStockRes,
    newsletterTotalRes,
    newsletterThisMonthRes,
    newsletterDiscountUsedRes,
    reviewsPendingRes,
    reviewsApprovedRes,
    reviewsTotalRes,
    activeDiscountsRes,
    expiringSoonRes,
    discountUsageRes,
    orderItemsRes,
    categoriesRes,
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "pending"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekStart),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", lastWeekStart)
      .lt("created_at", weekStart),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .lt("created_at", twentyFourHoursAgo),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("track_stock", true)
      .eq("stock_quantity", 0),
    supabase
      .from("orders")
      .select(
        "total, status, payment_method_name, shipping_method_name, billing_country, created_at"
      ),
    supabase
      .from("orders")
      .select(
        "id, order_number, total, status, created_at, billing_first_name, billing_last_name, billing_email"
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("products")
      .select("id, name_sk, sku, stock_quantity, low_stock_threshold")
      .eq("track_stock", true)
      .lte("stock_quantity", 50)
      .order("stock_quantity", { ascending: true })
      .limit(20),
    supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .gte("subscribed_at", monthStart),
    supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("discount_used", true),
    supabase
      .from("product_reviews")
      .select("*", { count: "exact", head: true })
      .eq("is_approved", false),
    supabase
      .from("product_reviews")
      .select("rating")
      .eq("is_approved", true),
    supabase
      .from("product_reviews")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("discounts")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("discounts")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .not("valid_until", "is", null)
      .lte("valid_until", sevenDaysFromNow),
    supabase.from("discounts").select("current_uses"),
    supabase
      .from("order_items")
      .select(
        "order_id, product_id, product_name, product_image_url, quantity, line_total, products(category_id)"
      ),
    supabase.from("categories").select("id, name_sk"),
  ]);

  const orders = ordersRes.data || [];
  const totalOrders = totalOrdersRes.count || 0;

  return {
    totalOrders,
    totalRevenue: sumField(orders, "total"),
    totalCustomers: customersCountRes.count || 0,
    pendingPayments: pendingPaymentsRes.count || 0,
    averageOrderValue:
      totalOrders > 0 ? sumField(orders, "total") / totalOrders : 0,
    ordersThisWeek: ordersThisWeekRes.count || 0,
    ordersLastWeek: ordersLastWeekRes.count || 0,
    revenueToday: sumField(
      orders.filter((o) => o.created_at >= todayStart),
      "total"
    ),
    revenueYesterday: sumField(
      orders.filter(
        (o) => o.created_at >= yesterdayStart && o.created_at < todayStart
      ),
      "total"
    ),
    ordersByStatus: buildOrdersByStatus(orders),
    recentOrders: buildRecentOrders(
      recentOrdersRes.data || [],
      orderItemsRes.data || []
    ),
    revenueByMonth: buildRevenueByMonth(orders, now.getFullYear()),
    salesByCategory: buildSalesByCategory(
      orderItemsRes.data || [],
      categoriesRes.data || []
    ),
    topProducts: buildTopProducts(orderItemsRes.data || []),
    lowStockProducts: buildLowStock(lowStockRes.data || []),
    paymentMethodStats: buildPaymentStats(orders),
    shippingMethodStats: buildShippingStats(orders),
    newsletterStats: {
      total: newsletterTotalRes.count || 0,
      thisMonth: newsletterThisMonthRes.count || 0,
      discountUsed: newsletterDiscountUsedRes.count || 0,
    },
    reviewStats: {
      pending: reviewsPendingRes.count || 0,
      averageRating: computeAvgRating(reviewsApprovedRes.data || []),
      totalReviews: reviewsTotalRes.count || 0,
    },
    discountStats: {
      active: activeDiscountsRes.count || 0,
      expiringSoon: expiringSoonRes.count || 0,
      totalUsed: (discountUsageRes.data || []).reduce(
        (sum, d) => sum + (d.current_uses || 0),
        0
      ),
    },
    customersByCountry: buildCountryStats(orders),
    pendingOrdersOld: pendingOrdersOldRes.count || 0,
    outOfStockCount: outOfStockRes.count || 0,
  };
}

function sumField(
  rows: { total?: string | number }[],
  field: "total"
): number {
  return rows.reduce((sum, r) => sum + (parseFloat(String(r[field])) || 0), 0);
}

function buildOrdersByStatus(
  orders: { status: string }[]
): { status: string; count: number }[] {
  const counts: Record<string, number> = {};
  orders.forEach((o) => {
    counts[o.status] = (counts[o.status] || 0) + 1;
  });
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

function buildRecentOrders(
  recent: {
    id: string;
    order_number: string;
    total: string | number;
    status: string;
    created_at: string;
    billing_first_name: string | null;
    billing_last_name: string | null;
    billing_email: string | null;
  }[],
  allItems: { order_id: string }[]
) {
  const countMap: Record<string, number> = {};
  allItems.forEach((item) => {
    countMap[item.order_id] = (countMap[item.order_id] || 0) + 1;
  });

  return recent.map((o) => ({
    id: o.id,
    order_number: o.order_number,
    customer_name:
      `${o.billing_first_name || ""} ${o.billing_last_name || ""}`.trim() ||
      "Neznamy",
    email: o.billing_email || "",
    total: parseFloat(String(o.total)) || 0,
    status: o.status,
    created_at: o.created_at,
    items_count: countMap[o.id] || 0,
  }));
}

function buildRevenueByMonth(
  orders: { total: string | number; created_at: string }[],
  currentYear: number
) {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "Maj", "Jun",
    "Jul", "Aug", "Sep", "Okt", "Nov", "Dec",
  ];
  return monthNames.map((month, i) => ({
    month,
    revenue: orders
      .filter((o) => {
        const d = new Date(o.created_at);
        return d.getFullYear() === currentYear && d.getMonth() === i;
      })
      .reduce((sum, o) => sum + (parseFloat(String(o.total)) || 0), 0),
  }));
}

function buildSalesByCategory(
  items: {
    line_total: string | number;
    products: unknown;
  }[],
  categories: { id: string; name_sk: string }[]
) {
  const catRevenue: Record<string, number> = {};
  items.forEach((item) => {
    const prods = item.products as { category_id: string } | null;
    const catId = prods?.category_id;
    if (catId) {
      catRevenue[catId] =
        (catRevenue[catId] || 0) + (parseFloat(String(item.line_total)) || 0);
    }
  });

  const total = Object.values(catRevenue).reduce((a, b) => a + b, 0);
  return categories
    .map((cat) => ({
      name: cat.name_sk,
      value:
        total > 0
          ? Math.round(((catRevenue[cat.id] || 0) / total) * 100)
          : 0,
    }))
    .filter((c) => c.value > 0);
}

function buildTopProducts(
  items: {
    product_id: string | null;
    product_name: string | null;
    product_image_url: string | null;
    quantity: number;
    line_total: string | number;
  }[]
) {
  const sales: Record<
    string,
    { quantity: number; revenue: number; name: string; image: string | null }
  > = {};

  items.forEach((item) => {
    if (!item.product_id) return;
    if (!sales[item.product_id]) {
      sales[item.product_id] = {
        quantity: 0,
        revenue: 0,
        name: item.product_name || "",
        image: item.product_image_url || null,
      };
    }
    sales[item.product_id].quantity += item.quantity || 0;
    sales[item.product_id].revenue +=
      parseFloat(String(item.line_total)) || 0;
  });

  return Object.entries(sales)
    .map(([id, data]) => ({
      id,
      name: data.name,
      image_url: data.image,
      quantity_sold: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

function buildLowStock(
  products: {
    id: string;
    name_sk: string;
    sku: string | null;
    stock_quantity: number;
    low_stock_threshold: number | null;
  }[]
) {
  return products
    .filter((p) => p.stock_quantity <= (p.low_stock_threshold || 5))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name_sk,
      sku: p.sku,
      stock_quantity: p.stock_quantity || 0,
      low_stock_threshold: p.low_stock_threshold || 5,
    }));
}

function buildPaymentStats(
  orders: { payment_method_name: string | null; total: string | number }[]
) {
  const counts: Record<string, { count: number; revenue: number }> = {};
  orders.forEach((o) => {
    const method = o.payment_method_name || "Nezname";
    if (!counts[method]) counts[method] = { count: 0, revenue: 0 };
    counts[method].count += 1;
    counts[method].revenue += parseFloat(String(o.total)) || 0;
  });
  return Object.entries(counts)
    .map(([name, data]) => ({
      name,
      count: data.count,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.count - a.count);
}

function buildShippingStats(
  orders: { shipping_method_name: string | null }[]
) {
  const counts: Record<string, number> = {};
  orders.forEach((o) => {
    const method = o.shipping_method_name || "Nezname";
    counts[method] = (counts[method] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function computeAvgRating(reviews: { rating: number }[]) {
  if (reviews.length === 0) return 0;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return Math.round(avg * 10) / 10;
}

function buildCountryStats(orders: { billing_country: string | null }[]) {
  const counts: Record<string, number> = {};
  orders.forEach((o) => {
    const country = o.billing_country || "SK";
    counts[country] = (counts[country] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}
