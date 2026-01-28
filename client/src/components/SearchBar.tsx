import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { searchProducts, Product } from "@/lib/products";
import { useI18n } from "@/i18n";

interface SearchBarProps {
  variant?: "desktop" | "mobile";
}

export default function SearchBar({ variant = "desktop" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useI18n();

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const results = await searchProducts(searchQuery);
    setSuggestions(results.slice(0, 5));
    setIsOpen(true);
    setIsLoading(false);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/vyhladavanie?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleProductClick = (slug: string) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/product/${slug}`);
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const isDesktop = variant === "desktop";

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full flex">
        <div className="relative flex-1">
          <Input
            type="search"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => query.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
            placeholder={t.search.searchPlaceholder}
            className={`${isDesktop ? "h-11 pl-4 pr-10" : "h-10 pl-4 pr-10"} w-full rounded-l-md border-border bg-secondary/30 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all`}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {isDesktop ? (
          <Button type="submit" className="h-11 rounded-l-none rounded-r-md px-6 font-bold tracking-wide">
            <Search className="h-5 w-5 mr-2" />
            {t.common.search}
          </Button>
        ) : (
          <Button type="submit" size="icon" className="h-10 w-12 rounded-l-none rounded-r-md">
            <Search className="h-4 w-4" />
          </Button>
        )}
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <ul>
                {suggestions.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => handleProductClick(product.slug)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-contain rounded bg-secondary/30"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {product.isSale && product.salePrice ? (
                          <>
                            <p className="text-sm font-bold text-primary">{product.salePrice.toFixed(2)} EUR</p>
                            <p className="text-xs text-muted-foreground line-through">{product.price.toFixed(2)} EUR</p>
                          </>
                        ) : (
                          <p className="text-sm font-bold">{product.price.toFixed(2)} EUR</p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full p-3 text-sm font-medium text-primary hover:bg-secondary/30 transition-colors border-t border-border"
              >
                {t.home.viewAll} "{query}"
              </button>
            </>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t.search.noResultsDesc.replace("{query}", query)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
