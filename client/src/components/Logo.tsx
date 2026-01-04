import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "light";
}

export default function Logo({ className, variant = "default" }: LogoProps) {
  return (
    <div className={cn("flex items-center select-none", className)}>
      <div className="relative flex items-center">
        {/* Top Left Bracket Accent */}
        <div className="absolute -top-1 -left-2 w-4 h-4 border-t-[3px] border-l-[3px] border-primary transform -skew-x-12" />

        {/* HD Box - Solid Green */}
        <div className="relative bg-primary text-primary-foreground px-3 py-1 transform -skew-x-12 z-10 flex items-center justify-center h-10 min-w-[3.5rem]">
          <span className="font-display font-black text-2xl tracking-tighter transform skew-x-12">HD</span>
        </div>

        {/* MOBIL Box - Outlined */}
        <div className="relative border-[3px] border-l-0 border-foreground px-3 py-1 transform -skew-x-12 flex items-center justify-center h-10 min-w-[5rem] -ml-[2px]">
          <span className="font-display font-black text-2xl tracking-tighter transform skew-x-12 text-foreground">MOBIL</span>
        </div>

        {/* Bottom Right Bracket Accent */}
        <div className="absolute -bottom-1 -right-2 w-4 h-4 border-b-[3px] border-r-[3px] border-foreground transform -skew-x-12" />
      </div>
    </div>
  );
}
