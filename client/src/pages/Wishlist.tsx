import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "wouter";

export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const { items, productIds, removeFromWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-12 md:py-20">
          <h1 className="mb-8 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Moje oblubene
          </h1>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="mt-4 h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
                <Skeleton className="mt-4 h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const isEmpty = isAuthenticated ? items.length === 0 : productIds.length === 0;

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <h1 className="mb-8 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Moje oblubene{" "}
          <span className="text-primary">
            ({isAuthenticated ? items.length : productIds.length} produktov)
          </span>
        </h1>

        {!isAuthenticated && productIds.length > 0 && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              Pre ulozenie vasich oblubenych produktov sa{" "}
              <Link href="/prihlasenie" className="font-semibold underline">
                prihlaste
              </Link>{" "}
              alebo{" "}
              <Link href="/registracia" className="font-semibold underline">
                zaregistrujte
              </Link>
              .
            </p>
          </div>
        )}

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-2xl bg-secondary/5">
            <div className="mb-6 rounded-full bg-secondary/20 p-6">
              <Heart className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Ziadne oblubene produkty
            </h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              Zatial ste si nepridali ziadne produkty do oblubenych. Prezrite si nasu ponuku a
              pridajte si produkty, ktore vas zaujmu.
            </p>
            <Button size="lg" className="mt-8 font-display tracking-wider" asChild>
              <Link href="/category/all">PREHLADAT PRODUKTY</Link>
            </Button>
          </div>
        ) : isAuthenticated ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-md hover:border-primary/50"
              >
                <div className="aspect-square overflow-hidden bg-white p-4 relative border-b border-border/50">
                  <Link href={`/product/${item.product.slug}`}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4">
                  <Link href={`/product/${item.product.slug}`}>
                    <h3 className="font-bold text-base text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-2 min-h-[2.5rem]">
                      {item.product.name}
                    </h3>
                  </Link>

                  {item.product.category && (
                    <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wide">
                      {item.product.category}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      {item.product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {item.product.originalPrice.toFixed(2)} EUR
                        </span>
                      )}
                      <span className="text-lg font-bold text-foreground">
                        {item.product.price.toFixed(2)} EUR
                      </span>
                    </div>

                    <Button
                      size="sm"
                      className="rounded-lg"
                      disabled={!item.product.inStock}
                      onClick={() =>
                        addToCart({
                          id: item.product.id,
                          name: item.product.name,
                          price: item.product.price,
                          salePrice: item.product.salePrice,
                          image: item.product.image,
                          slug: item.product.slug,
                          category: item.product.category,
                          categoryId: "",
                          description: "",
                          stock: item.product.inStock ? 1 : 0,
                          rating: 0,
                          isNew: false,
                          isSale: !!item.product.originalPrice,
                        })
                      }
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {item.product.inStock ? "Do kosika" : "Vypredane"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Pre zobrazenie vasich oblubenych produktov sa prihlaste.
            </p>
            <div className="mt-6 flex gap-4 justify-center">
              <Button asChild>
                <Link href="/prihlasenie">Prihlasit sa</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/registracia">Registrovat sa</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
