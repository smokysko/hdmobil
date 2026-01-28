import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOption } from "@/lib/products";

interface ProductSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Od najnovšieho" },
  { value: "oldest", label: "Od najstaršieho" },
  { value: "price_asc", label: "Od najlacnejšieho" },
  { value: "price_desc", label: "Od najdrahšieho" },
  { value: "name_asc", label: "Názov A-Z" },
  { value: "name_desc", label: "Názov Z-A" },
];

export function ProductSort({ value, onChange }: ProductSortProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Zoradiť" />
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
