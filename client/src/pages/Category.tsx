import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getProducts,
  getCategories,
  getSaleProducts,
  getNewProducts,
  Product,
  Category,
} from "@/lib/products";
import { useRoute } from "wouter";
import { useEffect, useState } from "react";

const SPECIAL_CATEGORIES: Record<string, { name: string; description: string }> = {
  akcia: {
    name: "Výpredaj",
    description: "Produkty v akcii za znížené ceny",
  },
  novinky: {
    name: "Novinky",
    description: "Najnovšie produkty v našej ponuke",
  },
  all: {
    name: "Všetky produkty",
    description: "Kompletná ponuka produktov",
  },
};

export default function CategoryPage() {
  const [, params] = useRoute("/category/:id");
  const categorySlug = params?.id || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isSpecialCategory = categorySlug in SPECIAL_CATEGORIES;

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      let prods: Product[] = [];

      if (categorySlug === "akcia") {
        prods = await getSaleProducts(50);
      } else if (categorySlug === "novinky") {
        prods = await getNewProducts(50);
      } else {
        prods = await getProducts({ categorySlug });
      }

      const cats = await getCategories();
      setProducts(prods);
      setCategories(cats);
      setIsLoading(false);
    }
    loadData();
  }, [categorySlug]);

  const category = categories.find((c) => c.slug === categorySlug);
  const specialCategory = SPECIAL_CATEGORIES[categorySlug];

  const categoryName = category?.name || specialCategory?.name || categorySlug;
  const categoryDescription = specialCategory?.description;

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
              {categoryDescription ||
                `Preskúmajte našu prémiovú kolekciu ${categoryName.toLowerCase()}.`}
            </p>
            {!isLoading && (
              <p className="text-sm text-muted-foreground mt-4">
                {products.length} produktov
              </p>
            )}
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
                V tejto kategórii sa nenašli žiadne produkty.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
