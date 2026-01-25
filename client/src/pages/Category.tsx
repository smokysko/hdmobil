import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getProducts, getCategories, Product, Category } from "@/lib/products";
import { useRoute } from "wouter";
import { useEffect, useState } from "react";
import NotFound from "./NotFound";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:id");
  const categorySlug = params?.id || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [prods, cats] = await Promise.all([
        getProducts({ categorySlug }),
        getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setIsLoading(false);
    }
    loadData();
  }, [categorySlug]);

  const category = categories.find((c) => c.slug === categorySlug);

  if (!isLoading && !category && categorySlug !== "all") return <NotFound />;

  const categoryName = category ? category.name : "Vsetky produkty";

  return (
    <Layout>
      <div className="bg-background py-12 md:py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl mb-6">
              {categoryName}
            </h1>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Preskumajte nasu premiovu kolekciu {categoryName.toLowerCase()}.
              Navrhnute pre vykon a styl.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-xl text-muted-foreground">
                V tejto kategorii sa nenasli ziadne produkty.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
