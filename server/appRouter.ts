import { router } from './_core/trpc';
import { productsRouter } from './routers/products';
import { cartRouter } from './routers/cart';
import { ordersRouter } from './routers/orders';
import { categoriesRouter } from './routers/categories';
import { discountsRouter } from './routers/discounts';
import { shippingRouter } from './routers/shipping';
import { paymentsRouter } from './routers/payments';
import { customersRouter } from './routers/customers';

export const appRouter = router({
  products: productsRouter,
  cart: cartRouter,
  orders: ordersRouter,
  categories: categoriesRouter,
  discounts: discountsRouter,
  shipping: shippingRouter,
  payments: paymentsRouter,
  customers: customersRouter,
});

export type AppRouter = typeof appRouter;
