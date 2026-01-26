import { useEffect, useState } from "react";
// import Logo from "./Logo";
import { cn } from "@/lib/utils";

interface PreloaderProps {
  images: string[];
  onComplete?: () => void;
}

export default function Preloader({ images, onComplete }: PreloaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let loadedCount = 0;
    const total = images.length;

    if (total === 0) {
      setIsLoading(false);
      onComplete?.();
      return;
    }

    const handleImageLoad = () => {
      loadedCount++;
      const newProgress = Math.round((loadedCount / total) * 100);
      setProgress(newProgress);

      if (loadedCount === total) {
        // Add a small delay to ensure the UI feels smooth
        setTimeout(() => {
          setIsLoading(false);
          setTimeout(() => {
            onComplete?.();
          }, 500); // Wait for fade out animation
        }, 500);
      }
    };

    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = handleImageLoad;
      img.onerror = handleImageLoad; // Continue even if one fails
    });
  }, [images, onComplete]);

  if (!isLoading && progress === 100) {
    // We keep it rendered but transparent for the fade-out effect
    // managed by the parent or CSS, but here we can handle internal state
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="relative flex flex-col items-center">
        <div className="mb-8 relative scale-150 animate-pulse">
           <img src="/images/hdmobil_logo_blue.jpg" alt="HDmobil Logo" className="h-16 w-auto object-contain" />
        </div>
        
        <div className="w-64 h-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs font-bold text-muted-foreground tracking-widest">
          NAČÍTAVAM {progress}%
        </div>
      </div>
    </div>
  );
}
