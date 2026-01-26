import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import {
  getProductById,
  getRecommendedAccessories,
  getRelatedProducts,
  Product,
} from "@/lib/products";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import NotFound from "./NotFound";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const id = params?.id || "";

  const [product, setProduct] = useState<Product | null>(null);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      setSelectedImageIndex(0);
      const prod = await getProductById(id);
      setProduct(prod);

      if (prod) {
        const [acc, related] = await Promise.all([
          getRecommendedAccessories(prod.id, 4),
          getRelatedProducts(prod.id, prod.categoryId, 4),
        ]);
        setAccessories(acc);
        setRelatedProducts(related);
      }

      setIsLoading(false);
    }
    if (id) {
      loadProduct();
    }
  }, [id]);

  const galleryImages = product?.gallery?.length ? product.gallery : [product?.image || ''];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 md:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <Skeleton className="aspect-square w-full rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) return <NotFound />;

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-secondary/30 p-10">
              {product.isNew && (
                <Badge className="absolute left-6 top-6 z-10 bg-primary text-primary-foreground font-display tracking-wide rounded-full px-4 py-1">
                  NOVINKA
                </Badge>
              )}
              {product.isSale && (
                <Badge
                  variant="destructive"
                  className="absolute left-6 top-6 z-10 font-display tracking-wide rounded-full px-4 py-1"
                >
                  AKCIA
                </Badge>
              )}
              <img
                src={galleryImages[selectedImageIndex]}
                alt={product.name}
                className="h-full w-full object-contain drop-shadow-lg transition-transform duration-700 hover:scale-105"
              />
              {galleryImages.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`aspect-square cursor-pointer rounded-xl border bg-secondary/30 p-3 transition-all hover:border-primary hover:shadow-sm ${
                    i === selectedImageIndex
                      ? "border-primary ring-1 ring-primary/30"
                      : "border-border"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-widest text-primary/80">
                  {product.category}
                </span>
                <div className="flex items-center gap-2 text-foreground/70 bg-secondary px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  <span className="font-bold text-foreground">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ({product.reviews} recenzií)
                  </span>
                </div>
              </div>

              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4">
                <span className="font-display text-4xl font-bold text-foreground">
                  {product.salePrice || product.price} EUR
                </span>
                {product.isSale && (
                  <span className="text-xl text-muted-foreground line-through decoration-destructive/50">
                    {product.price} EUR
                  </span>
                )}
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator className="bg-border/50" />

            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {key}
                  </span>
                  <p className="font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>

            <Separator className="bg-border/50" />

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-full border border-border bg-background shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-l-full hover:bg-secondary"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="flex h-12 w-12 items-center justify-center font-display font-bold text-lg">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-r-full hover:bg-secondary"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="lg"
                  className="flex-1 font-display tracking-wide h-14 text-base rounded-full shadow-lg hover:shadow-xl transition-all"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock > 0 ? "PRIDAŤ DO KOŠÍKA" : "VYPREDANÉ"}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 rounded-full border-border hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid gap-4 rounded-2xl border border-border bg-secondary/20 p-6 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    Expresná doprava zdarma
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    2-ročná oficiálna záruka
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    {product.stock > 0
                      ? `Skladom (${product.stock} ks)`
                      : "Momentálne nedostupné"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    30-dňová garancia vrátenia peňazí
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {accessories.length > 0 && (
        <section className="py-12 bg-secondary/30 border-t border-border">
          <div className="container">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Odporúčané príslušenstvo
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Doplnky, ktoré sa hodia k vášmu produktu
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {accessories.map((acc) => (
                <ProductCard key={acc.id} product={acc} />
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="py-12 bg-background border-t border-border">
          <div className="container">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Podobné produkty
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ďalšie produkty z kategórie {product.category}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
