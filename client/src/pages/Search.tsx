import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { searchProducts, Product } from "@/lib/products";
import { useI18n } from "@/i18n";

export default function Search() {
  const searchParams = useSearch();
  const query = new URLSearchParams(searchParams).get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const results = await searchProducts(query);
      setProducts(results);
      setIsLoading(false);
    };

    fetchResults();
  }, [query]);

  const getResultsText = (count: number) => {
    if (count === 0) return t.search.noResults;
    if (count === 1) return t.search.foundProduct.replace("{count}", "1");
    if (count < 5) return t.search.foundProductsFew.replace("{count}", String(count));
    return t.search.foundProducts.replace("{count}", String(count));
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {t.search.searchResults} "{query}"
          </h1>
          {!isLoading && (
            <p className="text-muted-foreground">
              {getResultsText(products.length)}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <SearchIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">{t.search.noResultsTitle}</h2>
            <p className="text-muted-foreground max-w-md">
              {t.search.noResultsDesc.replace("{query}", query)}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
