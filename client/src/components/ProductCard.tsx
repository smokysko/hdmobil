import { useCart } from "@/contexts/CartContext";
import { Product } from "@/../../shared/data";
import { ShoppingCart, Star } from "lucide-react";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_-10px_var(--color-primary)]">
      {/* Image Container */}
      <div className="aspect-square overflow-hidden bg-secondary/20 p-6 relative">
        {product.isNew && (
          <Badge className="absolute left-3 top-3 z-10 bg-primary text-primary-foreground hover:bg-primary font-display tracking-wider">
            NOVÉ
          </Badge>
        )}
        {product.isSale && (
          <Badge variant="destructive" className="absolute left-3 top-3 z-10 font-display tracking-wider">
            AKCIA
          </Badge>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl"
        />
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
          <Button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="translate-y-4 transition-transform duration-300 group-hover:translate-y-0 font-display tracking-wide"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            RÝCHLO PRIDAŤ
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-3 w-3 fill-current" />
            <span className="text-xs font-medium text-foreground">{product.rating}</span>
          </div>
        </div>
        <Link href={`/product/${product.id}`}>
          <h3 className="font-display text-lg font-bold leading-tight text-foreground transition-colors hover:text-primary cursor-pointer line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex flex-col">
          {product.isSale && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.price}
            </span>
          )}
          <span className="font-display text-xl font-bold text-primary">
            ${product.salePrice || product.price}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="opacity-0 transition-opacity group-hover:opacity-100 border-primary/20 hover:border-primary hover:bg-primary/10"
          asChild
        >
          <Link href={`/product/${product.id}`}>DETAILY</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
