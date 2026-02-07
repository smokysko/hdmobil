import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Neautorizovany pristup");

    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) throw new Error("Neautorizovany pristup");

    const { data: userProfile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (!userProfile?.is_admin) throw new Error("Pristup zamietnuty");

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
    const currentYear = now.getFullYear();

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
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("customers")
        .select("*", { count: "exact", head: true }),
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
          "product_id, product_name, product_image_url, quantity, line_total, products(category_id)"
        ),
      supabase.from("categories").select("id, name_sk"),
    ]);

    const orders = ordersRes.data || [];
    const totalOrders = totalOrdersRes.count || 0;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (parseFloat(o.total) || 0),
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const revenueToday = orders
      .filter((o) => o.created_at >= todayStart)
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    const revenueYesterday = orders
      .filter((o) => o.created_at >= yesterdayStart && o.created_at < todayStart)
      .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const ordersByStatus = Object.entries(statusCounts).map(
      ([status, count]) => ({ status, count })
    );

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Maj", "Jun",
      "Jul", "Aug", "Sep", "Okt", "Nov", "Dec",
    ];
    const revenueByMonth = monthNames.map((month, i) => {
      const revenue = orders
        .filter((o) => {
          const d = new Date(o.created_at);
          return d.getFullYear() === currentYear && d.getMonth() === i;
        })
        .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      return { month, revenue };
    });

    const paymentCounts: Record<string, { count: number; revenue: number }> =
      {};
    orders.forEach((o) => {
      const method = o.payment_method_name || "Nezname";
      if (!paymentCounts[method])
        paymentCounts[method] = { count: 0, revenue: 0 };
      paymentCounts[method].count += 1;
      paymentCounts[method].revenue += parseFloat(o.total) || 0;
    });
    const paymentMethodStats = Object.entries(paymentCounts)
      .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
      .sort((a, b) => b.count - a.count);

    const shippingCounts: Record<string, number> = {};
    orders.forEach((o) => {
      const method = o.shipping_method_name || "Nezname";
      shippingCounts[method] = (shippingCounts[method] || 0) + 1;
    });
    const shippingMethodStats = Object.entries(shippingCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const countryCounts: Record<string, number> = {};
    orders.forEach((o) => {
      const country = o.billing_country || "SK";
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    const customersByCountry = Object.entries(countryCounts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentOrders = (recentOrdersRes.data || []).map((o) => ({
      id: o.id,
      order_number: o.order_number,
      customer_name:
        `${o.billing_first_name || ""} ${o.billing_last_name || ""}`.trim() ||
        "Neznamy",
      email: o.billing_email || "",
      total: parseFloat(o.total) || 0,
      status: o.status,
      created_at: o.created_at,
      items_count: 0,
    }));

    if (recentOrders.length > 0) {
      const orderIds = recentOrders.map((o) => o.id);
      const { data: itemRows } = await supabase
        .from("order_items")
        .select("order_id")
        .in("order_id", orderIds);

      const countMap: Record<string, number> = {};
      (itemRows || []).forEach((item) => {
        countMap[item.order_id] = (countMap[item.order_id] || 0) + 1;
      });
      recentOrders.forEach((o) => {
        o.items_count = countMap[o.id] || 0;
      });
    }

    const orderItems = orderItemsRes.data || [];
    const categories = categoriesRes.data || [];

    const categoryRevenue: Record<string, number> = {};
    orderItems.forEach((item) => {
      const prods = item.products as unknown as {
        category_id: string;
      } | null;
      const catId = prods?.category_id;
      if (catId) {
        categoryRevenue[catId] =
          (categoryRevenue[catId] || 0) +
          (parseFloat(String(item.line_total)) || 0);
      }
    });

    const totalCategoryRevenue = Object.values(categoryRevenue).reduce(
      (a, b) => a + b,
      0
    );
    const salesByCategory = categories
      .map((cat) => ({
        name: cat.name_sk,
        value:
          totalCategoryRevenue > 0
            ? Math.round(
                ((categoryRevenue[cat.id] || 0) / totalCategoryRevenue) * 100
              )
            : 0,
      }))
      .filter((c) => c.value > 0);

    const productSales: Record<
      string,
      { quantity: number; revenue: number; name: string; image: string | null }
    > = {};
    orderItems.forEach((item) => {
      if (item.product_id) {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            quantity: 0,
            revenue: 0,
            name: item.product_name || "",
            image: item.product_image_url || null,
          };
        }
        productSales[item.product_id].quantity += item.quantity || 0;
        productSales[item.product_id].revenue +=
          parseFloat(String(item.line_total)) || 0;
      }
    });

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({
        id,
        name: data.name,
        image_url: data.image,
        quantity_sold: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const lowStockProducts = (lowStockRes.data || [])
      .filter((p) => p.stock_quantity <= (p.low_stock_threshold || 5))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name_sk,
        sku: p.sku,
        stock_quantity: p.stock_quantity || 0,
        low_stock_threshold: p.low_stock_threshold || 5,
      }));

    const approvedReviews = reviewsApprovedRes.data || [];
    const avgRating =
      approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
          approvedReviews.length
        : 0;

    const discountTotalUsed = (discountUsageRes.data || []).reduce(
      (sum, d) => sum + (d.current_uses || 0),
      0
    );

    const stats = {
      totalOrders,
      totalRevenue,
      totalCustomers: customersCountRes.count || 0,
      pendingPayments: pendingPaymentsRes.count || 0,
      averageOrderValue,
      ordersThisWeek: ordersThisWeekRes.count || 0,
      ordersLastWeek: ordersLastWeekRes.count || 0,
      revenueToday,
      revenueYesterday,
      ordersByStatus,
      recentOrders,
      revenueByMonth,
      salesByCategory,
      topProducts,
      lowStockProducts,
      paymentMethodStats,
      shippingMethodStats,
      newsletterStats: {
        total: newsletterTotalRes.count || 0,
        thisMonth: newsletterThisMonthRes.count || 0,
        discountUsed: newsletterDiscountUsedRes.count || 0,
      },
      reviewStats: {
        pending: reviewsPendingRes.count || 0,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviewsTotalRes.count || 0,
      },
      discountStats: {
        active: activeDiscountsRes.count || 0,
        expiringSoon: expiringSoonRes.count || 0,
        totalUsed: discountTotalUsed,
      },
      customersByCountry,
      pendingOrdersOld: pendingOrdersOldRes.count || 0,
      outOfStockCount: outOfStockRes.count || 0,
    };

    return jsonResponse({ success: true, data: stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neznama chyba";
    return jsonResponse({ success: false, error: message }, 400);
  }
});
