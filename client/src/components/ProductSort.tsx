import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOption } from "@/lib/products";
import { useI18n } from '@/i18n';

interface ProductSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function ProductSort({ value, onChange }: ProductSortProps) {
  const { t } = useI18n();
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: t.product.sortNewest },
    { value: "oldest", label: t.product.sortOldest },
    { value: "price_asc", label: t.product.sortPriceAsc },
    { value: "price_desc", label: t.product.sortPriceDesc },
    { value: "name_asc", label: t.product.sortNameAsc },
    { value: "name_desc", label: t.product.sortNameDesc },
  ];

  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={t.product.sortBy} />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
