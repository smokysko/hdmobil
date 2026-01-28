import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Product } from "@/lib/products";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "wouter";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  return (
    <Card className="group relative overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-md hover:border-primary/50 rounded-lg h-full flex flex-col">
      {/* Image Container */}
      <div className="aspect-square overflow-hidden bg-white p-6 relative border-b border-border/50">
        {/* Badges - Top Left */}
        <div className="absolute left-0 top-0 z-10 flex flex-col gap-1 p-2">
          {product.isNew && (
            <Badge className="bg-blue-600 text-white hover:bg-blue-700 font-bold text-[10px] uppercase rounded-sm px-2 py-0.5 w-fit">
              NOVINKA
            </Badge>
          )}
          {product.isSale && (
            <Badge variant="destructive" className="font-bold text-[10px] uppercase rounded-sm px-2 py-0.5 w-fit">
              AKCIA
            </Badge>
          )}
        </div>

        {/* Wishlist & Stock Status - Top Right */}
        <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`p-1.5 rounded-full transition-all ${
              inWishlist
                ? "bg-red-50 text-red-500 hover:bg-red-100"
                : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-red-50"
            } shadow-sm`}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
          </button>
          {product.stock > 0 ? (
            <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-sm border border-green-100">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></div>
              SKLADOM
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-sm border border-red-100">
              VYPREDANE
            </div>
          )}
        </div>

        <Link href={`/product/${product.slug}`}>
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 cursor-pointer"
          />
        </Link>
      </div>

      {/* Content */}
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-bold text-base leading-tight text-foreground transition-colors hover:text-primary cursor-pointer line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>
        </div>
        
        {/* Tech Specs / Description Preview */}
        <div className="text-xs text-muted-foreground mb-3 line-clamp-2 min-h-[2rem]">
          {product.description}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`h-3 w-3 ${star <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({Math.floor(Math.random() * 50) + 5})</span>
        </div>

        <div className="mt-auto pt-2 border-t border-border/50 flex items-center justify-between">
          <div className="flex flex-col">
            {product.isSale && (
              <span className="text-xs text-muted-foreground line-through">
                {product.price} €
              </span>
            )}
            <span className={`text-lg font-bold ${product.isSale ? "text-destructive" : "text-foreground"}`}>
              {product.salePrice || product.price} €
            </span>
            <span className="text-[10px] text-muted-foreground">s DPH</span>
          </div>
          
          <Button 
            size="icon"
            className="h-9 w-9 rounded-md shadow-sm hover:shadow-md transition-all bg-primary hover:bg-primary/90"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
          >
            <ShoppingCart className="h-4 w-4 text-primary-foreground" />
            <span className="sr-only">Do košíka</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
