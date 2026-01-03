import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

interface Subcategory {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  subcategories: Subcategory[];
}

interface CollapsibleMenuProps {
  item: NavItem;
  onClose?: () => void;
}

export default function CollapsibleMenu({ item, onClose }: CollapsibleMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const isActive = location.startsWith(item.href);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex items-center justify-between w-full group">
        <Link href={item.href} onClick={onClose}>
          <span className={cn(
            "text-lg font-medium transition-colors hover:text-primary cursor-pointer py-2 block flex-1",
            isActive ? "text-primary" : "text-muted-foreground"
          )}>
            {item.name}
          </span>
        </Link>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-secondary/50">
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen ? "rotate-180" : ""
            )} />
            <span className="sr-only">Toggle {item.name} menu</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="pl-4 flex flex-col gap-1 border-l-2 border-border/50 ml-2 mb-2 py-1">
          {item.subcategories.map((sub) => (
            <Link key={sub.href} href={sub.href} onClick={onClose}>
              <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer py-2 block transition-colors flex items-center gap-2">
                <ChevronRight className="h-3 w-3 opacity-50" />
                {sub.name}
              </span>
            </Link>
          ))}
          <Link href={item.href} onClick={onClose}>
            <span className="text-xs font-bold text-primary uppercase tracking-wider py-2 block mt-1 pl-5">
              Všetko z {item.name}
            </span>
          </Link>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
