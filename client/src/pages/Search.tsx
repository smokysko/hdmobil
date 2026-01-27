import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { searchProducts, Product } from "@/lib/products";

export default function Search() {
  const searchParams = useSearch();
  const query = new URLSearchParams(searchParams).get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            Výsledky vyhľadávania pre "{query}"
          </h1>
          {!isLoading && (
            <p className="text-muted-foreground">
              {products.length === 0
                ? "Nenašli sa žiadne produkty"
                : `Nájdených ${products.length} ${products.length === 1 ? "produkt" : products.length < 5 ? "produkty" : "produktov"}`}
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
            <h2 className="text-lg font-semibold mb-2">Žiadne výsledky</h2>
            <p className="text-muted-foreground max-w-md">
              Pre "{query}" sme nenašli žiadne produkty. Skúste iný výraz alebo
              prezrite naše kategórie.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
