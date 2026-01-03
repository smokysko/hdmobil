import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const shipping = cartTotal > 500 ? 0 : 15;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

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
                  className="flex gap-4 rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-colors hover:border-primary/30"
                >
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border/50 bg-secondary/20 p-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="font-display font-bold text-foreground">
                          <Link href={`/product/${item.id}`} className="hover:text-primary transition-colors">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <p className="font-display font-bold text-primary">
                        ${(item.salePrice || item.price) * item.quantity}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-border bg-background/50">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none hover:bg-secondary"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="flex h-8 w-10 items-center justify-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-none hover:bg-secondary"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
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
              <div className="sticky top-24 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                <h2 className="font-display text-xl font-bold text-foreground mb-6">Súhrn objednávky</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Medzisúčet</span>
                    <span className="font-medium">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Doprava</span>
                    <span className="font-medium">
                      {shipping === 0 ? "Zdarma" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Odhadovaná daň</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <Separator className="bg-border/50" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Spolu</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                  
                  <Button size="lg" className="w-full font-display tracking-wider mt-4" asChild>
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
