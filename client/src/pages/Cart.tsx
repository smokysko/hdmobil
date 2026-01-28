import { DiscountCodeInput } from "@/components/DiscountCodeInput";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, cartTotal, discountAmount, appliedDiscount } = useCart();
  const shipping = cartTotal > 100 ? 0 : 4.99;
  const total = cartTotal + shipping - discountAmount;

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <h1 className="mb-8 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Váš košík <span className="text-primary">({items.length} položiek)</span>
        </h1>

        {items.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-secondary/30 p-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground mb-1">
                          <Link href={`/product/${item.id}`} className="hover:text-primary transition-colors">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{item.category}</p>
                      </div>
                      <p className="font-display text-lg font-bold text-foreground">
                        {((item.salePrice || item.price) * item.quantity).toFixed(2)} EUR
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center rounded-full border border-border bg-background shadow-sm">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-l-full hover:bg-secondary"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="flex h-9 w-10 items-center justify-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-r-full hover:bg-secondary"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full px-4"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Odstrániť
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-3xl border border-border bg-card p-8 shadow-sm">
                <h2 className="font-display text-xl font-bold text-foreground mb-6">Súhrn objednávky</h2>

                <div className="space-y-4">
                  <DiscountCodeInput />

                  <Separator className="bg-border/50" />

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Medzisúčet</span>
                    <span className="font-medium">{cartTotal.toFixed(2)} EUR</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Zľava ({appliedDiscount?.code})</span>
                      <span className="font-medium">-{discountAmount.toFixed(2)} EUR</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Doprava</span>
                    <span className="font-medium">
                      {shipping === 0 ? "Zdarma" : `${shipping.toFixed(2)} EUR`}
                    </span>
                  </div>

                  <Separator className="bg-border/50" />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Spolu</span>
                    <span className="text-foreground">{total.toFixed(2)} EUR</span>
                  </div>
                  
                  <Button size="lg" className="w-full font-display tracking-wide mt-6 h-12 rounded-full shadow-lg hover:shadow-xl transition-all" asChild>
                    <Link href="/checkout">
                      PREJSŤ K POKLADNI <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <div className="mt-4 text-center">
                    <Link href="/category/all" className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
                      Pokračovať v nákupe
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl bg-secondary/5">
            <div className="mb-6 rounded-full bg-secondary/20 p-6">
              <ArrowRight className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Váš košík je prázdny</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Zdá sa, že ste do košíka ešte nič nepridali. Preskúmajte našu prémiovú kolekciu a nájdite svoje ďalšie zariadenie.
            </p>
            <Button size="lg" className="mt-8 font-display tracking-wider" asChild>
              <Link href="/category/all">ZAČAŤ NAKUPOVAŤ</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
