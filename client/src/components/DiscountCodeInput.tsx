import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { Loader2, Tag, X } from "lucide-react";
import { useState } from "react";
import { useI18n } from '@/i18n';

export function DiscountCodeInput() {
  const { t } = useI18n();
  const { appliedDiscount, applyDiscount, removeDiscount, isApplyingDiscount } = useCart();
  const [code, setCode] = useState("");

  const handleApply = async () => {
    const success = await applyDiscount(code);
    if (success) {
      setCode("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  if (appliedDiscount) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <Tag className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">{appliedDiscount.code}</p>
            <p className="text-xs text-muted-foreground">
              {appliedDiscount.discountType === "percentage"
                ? `-${appliedDiscount.value}%`
                : `-${appliedDiscount.value.toFixed(2)} EUR`}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={removeDiscount}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder={t.discountCode.placeholder}
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={handleKeyDown}
        disabled={isApplyingDiscount}
        className="flex-1"
      />
      <Button onClick={handleApply} disabled={isApplyingDiscount || !code.trim()} variant="outline">
        {isApplyingDiscount ? <Loader2 className="h-4 w-4 animate-spin" /> : t.discountCode.apply}
      </Button>
    </div>
  );
}
