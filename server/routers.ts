import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { productsRouter } from "./routers/products";
import { cartRouter } from "./routers/cart";
import { ordersRouter } from "./routers/orders";
import { categoriesRouter } from "./routers/categories";
import { discountsRouter } from "./routers/discounts";
import { shippingRouter } from "./routers/shipping";
import { paymentsRouter } from "./routers/payments";
import { customersRouter } from "./routers/customers";
import { cmsRouter } from "./routers/cms";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(() => {
      return { success: true } as const;
    }),
  }),
  products: productsRouter,
  cart: cartRouter,
  orders: ordersRouter,
  categories: categoriesRouter,
  discounts: discountsRouter,
  shipping: shippingRouter,
  payments: paymentsRouter,
  customers: customersRouter,
  cms: cmsRouter,
});

export type AppRouter = typeof appRouter;
