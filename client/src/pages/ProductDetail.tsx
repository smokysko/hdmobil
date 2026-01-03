import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { products } from "@/../../shared/data";
import { Check, Minus, Plus, Share2, Shield, ShoppingCart, Star, Truck } from "lucide-react";
import { useState } from "react";
import { useRoute } from "wouter";
import NotFound from "./NotFound";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const id = params ? parseInt(params.id) : 0;
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return <NotFound />;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/50 bg-secondary/20 p-8 backdrop-blur-sm">
              {product.isNew && (
                <Badge className="absolute left-4 top-4 z-10 bg-primary text-primary-foreground font-display tracking-wider">
                  NOVINKA
                </Badge>
              )}
              {product.isSale && (
                <Badge variant="destructive" className="absolute left-4 top-4 z-10 font-display tracking-wider">
                  AKCIA
                </Badge>
              )}
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={`aspect-square cursor-pointer rounded-lg border bg-secondary/20 p-2 transition-all hover:border-primary ${i === 0 ? 'border-primary ring-1 ring-primary/50' : 'border-border/50'}`}
                >
                  <img
                    src={product.image}
                    alt={`${product.name} view ${i + 1}`}
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium uppercase tracking-widest text-primary">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium text-foreground">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews} recenzií)</span>
                </div>
              </div>
              
              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-4">
                <span className="font-display text-4xl font-bold text-primary">
                  ${product.salePrice || product.price}
                </span>
                {product.isSale && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.price}
                  </span>
                )}
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator className="bg-border/50" />

            {/* Specs */}
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <span className="text-xs font-medium uppercase text-muted-foreground">{key}</span>
                  <p className="font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <Separator className="bg-border/50" />

            {/* Actions */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-md border border-border bg-background">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none hover:bg-secondary"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="flex h-10 w-12 items-center justify-center font-display font-bold">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none hover:bg-secondary"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  size="lg" 
                  className="flex-1 font-display tracking-wider h-12 text-base"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  PRIDAŤ DO KOŠÍKA
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12 border-border/50 hover:border-primary hover:text-primary">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid gap-4 rounded-lg border border-border/50 bg-secondary/10 p-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Expresná doprava zdarma</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">2-ročná oficiálna záruka</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Skladom a pripravené na odoslanie</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">30-dňová garancia vrátenia peňazí</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
