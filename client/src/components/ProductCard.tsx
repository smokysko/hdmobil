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
    <Card className="group relative overflow-hidden border-border bg-card transition-all duration-500 hover:shadow-lg hover:-translate-y-1 rounded-2xl">
      {/* Image Container */}
      <div className="aspect-square overflow-hidden bg-secondary/30 p-8 relative transition-colors group-hover:bg-secondary/50">
        {product.isNew && (
          <Badge className="absolute left-4 top-4 z-10 bg-primary text-primary-foreground hover:bg-primary font-display tracking-wide rounded-full px-3">
            NOVÉ
          </Badge>
        )}
        {product.isSale && (
          <Badge variant="destructive" className="absolute left-4 top-4 z-10 font-display tracking-wide rounded-full px-3">
            AKCIA
          </Badge>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-sm"
        />
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 transition-all duration-300 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100">
          <Button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-full gap-2 font-display tracking-wide shadow-lg rounded-full h-11"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            RÝCHLO PRIDAŤ
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-6 pb-2">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-foreground/70 text-xs font-bold bg-secondary px-2 py-1 rounded-full">
            <Star className="h-3 w-3 fill-current text-yellow-500" />
            <span className="text-xs font-medium text-foreground">{product.rating}</span>
          </div>
        </div>
        <Link href={`/product/${product.id}`}>
          <h3 className="font-display text-xl font-bold leading-tight text-foreground transition-colors hover:text-primary cursor-pointer line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between p-6 pt-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold text-foreground">
            ${product.salePrice || product.price}
          </span>
          {product.isSale && (
            <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
              ${product.price}
            </span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:text-primary hover:bg-primary/10 font-bold tracking-wide"
          asChild
        >
          <Link href={`/product/${product.id}`}>DETAILY</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
