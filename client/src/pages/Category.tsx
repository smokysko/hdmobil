import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { ProductFilters, getActiveFiltersCount } from "@/components/ProductFilters";
import { ProductSort } from "@/components/ProductSort";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getProductsWithMeta,
  getCategories,
  getSaleProducts,
  getNewProducts,
  getCategoryPriceRange,
  Product,
  Category,
  SortOption,
  ProductFilters as Filters,
} from "@/lib/products";
import { useRoute, useLocation, useSearch } from "wouter";
import { useEffect, useState, useMemo, useCallback } from "react";

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

function parseFiltersFromUrl(search: string): { filters: Filters; sortBy: SortOption } {
  const params = new URLSearchParams(search);

  const filters: Filters = {};
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");

  if (minPrice) filters.minPrice = Number(minPrice);
  if (maxPrice) filters.maxPrice = Number(maxPrice);
  if (params.get("inStock") === "true") filters.inStock = true;
  if (params.get("isNew") === "true") filters.isNew = true;
  if (params.get("isSale") === "true") filters.isSale = true;
  if (params.get("isBazaar") === "true") filters.isBazaar = true;

  const sortBy = (params.get("sort") as SortOption) || "newest";

  return { filters, sortBy };
}

function buildUrlParams(filters: Filters, sortBy: SortOption): string {
  const params = new URLSearchParams();

  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.inStock) params.set("inStock", "true");
  if (filters.isNew) params.set("isNew", "true");
  if (filters.isSale) params.set("isSale", "true");
  if (filters.isBazaar) params.set("isBazaar", "true");
  if (sortBy !== "newest") params.set("sort", sortBy);

  const str = params.toString();
  return str ? `?${str}` : "";
}

export default function CategoryPage() {
  const [, params] = useRoute("/category/:id");
  const [, setLocation] = useLocation();
  const search = useSearch();
  const categorySlug = params?.id || "all";

  const { filters: urlFilters, sortBy: urlSortBy } = useMemo(
    () => parseFiltersFromUrl(search),
    [search]
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [filters, setFilters] = useState<Filters>(urlFilters);
  const [sortBy, setSortBy] = useState<SortOption>(urlSortBy);

  const isSpecialCategory = categorySlug in SPECIAL_CATEGORIES;

  useEffect(() => {
    setFilters(urlFilters);
    setSortBy(urlSortBy);
  }, [search]);

  useEffect(() => {
    async function loadPriceRange() {
      if (!isSpecialCategory) {
        const range = await getCategoryPriceRange(categorySlug);
        setPriceRange(range);
      } else {
        setPriceRange({ min: 0, max: 2000 });
      }
    }
    loadPriceRange();
  }, [categorySlug, isSpecialCategory]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      let prods: Product[] = [];
      let total = 0;

      if (categorySlug === "akcia") {
        prods = await getSaleProducts(100);
        total = prods.length;
      } else if (categorySlug === "novinky") {
        prods = await getNewProducts(100);
        total = prods.length;
      } else {
        const result = await getProductsWithMeta({
          categorySlug,
          filters,
          sortBy,
        });
        prods = result.products;
        total = result.total;
      }

      const cats = await getCategories();
      setProducts(prods);
      setTotalProducts(total);
      setCategories(cats);
      setIsLoading(false);
    }
    loadData();
  }, [categorySlug, filters, sortBy]);

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    const newUrl = `/category/${categorySlug}${buildUrlParams(newFilters, sortBy)}`;
    setLocation(newUrl, { replace: true });
  }, [categorySlug, sortBy, setLocation]);

  const handleSortChange = useCallback((newSortBy: SortOption) => {
    const newUrl = `/category/${categorySlug}${buildUrlParams(filters, newSortBy)}`;
    setLocation(newUrl, { replace: true });
  }, [categorySlug, filters, setLocation]);

  const category = categories.find((c) => c.slug === categorySlug);
  const specialCategory = SPECIAL_CATEGORIES[categorySlug];

  const categoryName = category?.name || specialCategory?.name || categorySlug;
  const categoryDescription = specialCategory?.description;

  const activeFiltersCount = getActiveFiltersCount(filters);
  const showFilters = !isSpecialCategory;

  return (
    <Layout>
      <div className="bg-background py-8 md:py-12">
        <div className="container">
          <div className="mb-8 md:mb-12 text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl mb-4">
              {categoryName}
            </h1>
            <div className="h-1 w-16 bg-primary mx-auto rounded-full mb-4"></div>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {categoryDescription ||
                `Preskúmajte našu prémiovú kolekciu ${categoryName.toLowerCase()}.`}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {showFilters && (
              <ProductFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                priceRange={priceRange}
                activeFiltersCount={activeFiltersCount}
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  {showFilters && (
                    <div className="lg:hidden">
                      <ProductFilters
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        priceRange={priceRange}
                        activeFiltersCount={activeFiltersCount}
                      />
                    </div>
                  )}
                  {!isLoading && (
                    <p className="text-sm text-muted-foreground">
                      {totalProducts} {totalProducts === 1 ? "produkt" : totalProducts < 5 ? "produkty" : "produktov"}
                    </p>
                  )}
                </div>

                <ProductSort value={sortBy} onChange={handleSortChange} />
              </div>

              {isLoading ? (
                <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-square w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-lg text-muted-foreground mb-4">
                    Žiadne produkty nezodpovedajú vybraným filtrom.
                  </p>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() => handleFiltersChange({})}
                      className="text-primary hover:underline text-sm"
                    >
                      Vymazať všetky filtre
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
