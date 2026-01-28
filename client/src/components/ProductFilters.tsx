import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, X } from "lucide-react";
import type { ProductFilters as Filters } from "@/lib/products";

interface ProductFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  priceRange: { min: number; max: number };
  activeFiltersCount: number;
}

function FilterContent({
  filters,
  onFiltersChange,
  priceRange,
  localPriceRange,
  setLocalPriceRange,
  onClearFilters,
}: {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  priceRange: { min: number; max: number };
  localPriceRange: [number, number];
  setLocalPriceRange: (range: [number, number]) => void;
  onClearFilters: () => void;
}) {
  const handlePriceChange = (values: number[]) => {
    setLocalPriceRange([values[0], values[1]]);
  };

  const handlePriceCommit = (values: number[]) => {
    onFiltersChange({
      ...filters,
      minPrice: values[0] > priceRange.min ? values[0] : undefined,
      maxPrice: values[1] < priceRange.max ? values[1] : undefined,
    });
  };

  const handleCheckboxChange = (key: keyof Filters, checked: boolean) => {
    onFiltersChange({
      ...filters,
      [key]: checked || undefined,
    });
  };

  const hasActiveFilters =
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStock ||
    filters.isNew ||
    filters.isSale ||
    filters.isBazaar;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-4">Cena</h3>
        <Slider
          value={localPriceRange}
          min={priceRange.min}
          max={priceRange.max}
          step={1}
          onValueChange={handlePriceChange}
          onValueCommit={handlePriceCommit}
          className="mb-3"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{localPriceRange[0]} EUR</span>
          <span>{localPriceRange[1]} EUR</span>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-sm mb-4">Dostupnost</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={filters.inStock || false}
              onCheckedChange={(checked) => handleCheckboxChange("inStock", checked === true)}
            />
            <span className="text-sm">Na sklade</span>
          </label>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold text-sm mb-4">Typ produktu</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={filters.isNew || false}
              onCheckedChange={(checked) => handleCheckboxChange("isNew", checked === true)}
            />
            <span className="text-sm">Novinky</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={filters.isSale || false}
              onCheckedChange={(checked) => handleCheckboxChange("isSale", checked === true)}
            />
            <span className="text-sm">V akcii</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={filters.isBazaar || false}
              onCheckedChange={(checked) => handleCheckboxChange("isBazaar", checked === true)}
            />
            <span className="text-sm">Bazar</span>
          </label>
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <Separator />
          <Button
            variant="outline"
            className="w-full"
            onClick={onClearFilters}
          >
            <X className="w-4 h-4 mr-2" />
            Vymazat filtre
          </Button>
        </>
      )}
    </div>
  );
}

export function ProductFilters({
  filters,
  onFiltersChange,
  priceRange,
  activeFiltersCount,
}: ProductFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    filters.minPrice ?? priceRange.min,
    filters.maxPrice ?? priceRange.max,
  ]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLocalPriceRange([
      filters.minPrice ?? priceRange.min,
      filters.maxPrice ?? priceRange.max,
    ]);
  }, [priceRange.min, priceRange.max, filters.minPrice, filters.maxPrice]);

  const handleClearFilters = () => {
    setLocalPriceRange([priceRange.min, priceRange.max]);
    onFiltersChange({});
  };

  return (
    <>
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 bg-card border border-border rounded-lg p-5">
          <h2 className="font-semibold text-lg mb-5">Filtre</h2>
          <FilterContent
            filters={filters}
            onFiltersChange={onFiltersChange}
            priceRange={priceRange}
            localPriceRange={localPriceRange}
            setLocalPriceRange={setLocalPriceRange}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filtre
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle>Filtre</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent
                filters={filters}
                onFiltersChange={(newFilters) => {
                  onFiltersChange(newFilters);
                }}
                priceRange={priceRange}
                localPriceRange={localPriceRange}
                setLocalPriceRange={setLocalPriceRange}
                onClearFilters={() => {
                  handleClearFilters();
                  setIsOpen(false);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export function getActiveFiltersCount(filters: Filters): number {
  let count = 0;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
  if (filters.inStock) count++;
  if (filters.isNew) count++;
  if (filters.isSale) count++;
  if (filters.isBazaar) count++;
  return count;
}
