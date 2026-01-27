import { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HeroSlide {
  id: string;
  product_id: string | null;
  title_sk: string;
  subtitle_sk: string | null;
  badge_text: string | null;
  image_url: string | null;
  price: number | null;
  original_price: number | null;
  features: Array<{ icon?: string; text: string }>;
  specs: Array<{ label: string; value: string }>;
  link_url: string | null;
  link_text: string | null;
  secondary_link_url: string | null;
  secondary_link_text: string | null;
  background_color: string | null;
  text_color: string | null;
  is_active: boolean;
  sort_order: number;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoRotateInterval?: number;
  height?: string;
}

export default function HeroCarousel({
  slides,
  autoRotateInterval = 5000,
  height = 'auto',
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeSlides = slides.filter((s) => s.is_active);

  const goToNext = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const goToPrev = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (isPaused || activeSlides.length <= 1 || autoRotateInterval <= 0) return;

    const interval = setInterval(goToNext, autoRotateInterval);
    return () => clearInterval(interval);
  }, [isPaused, activeSlides.length, autoRotateInterval, goToNext]);

  if (activeSlides.length === 0) {
    return null;
  }

  const currentSlide = activeSlides[currentIndex];
  const features = currentSlide.features || [];
  const specs = currentSlide.specs || [];

  return (
    <div
      className="relative overflow-hidden"
      style={{ height }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-full">
        {activeSlides.map((slide, index) => {
          const isActive = index === currentIndex;
          const slideFeatures = slide.features || [];
          const slideSpecs = slide.specs || [];

          return (
            <div
              key={slide.id}
              className={cn(
                'absolute inset-0 transition-all duration-700 ease-in-out',
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              )}
              style={{
                backgroundColor: slide.background_color || undefined,
                color: slide.text_color || undefined,
              }}
            >
              <div className="container relative z-10 py-2 lg:py-4 h-full flex flex-col justify-start">
                <div className="grid lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
                    {slide.badge_text && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                        <Star className="w-3 h-3 fill-primary" />
                        {slide.badge_text}
                      </div>
                    )}

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                      {slide.title_sk}
                      {slide.subtitle_sk && (
                        <>
                          <br />
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                            {slide.subtitle_sk}
                          </span>
                        </>
                      )}
                    </h1>

                    {slideFeatures.length > 0 && (
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground border-l-2 border-primary/30 pl-4 my-3">
                        {slideFeatures.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            <span>{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {slide.price && (
                      <div className="flex items-end gap-4 mb-2">
                        <div className="text-3xl font-bold text-foreground">
                          {slide.price.toLocaleString('sk-SK')} EUR
                        </div>
                        {slide.original_price && slide.original_price > slide.price && (
                          <div className="text-lg text-muted-foreground line-through mb-1">
                            {slide.original_price.toLocaleString('sk-SK')} EUR
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {slide.link_url && slide.link_text && (
                        <Button
                          size="lg"
                          className="h-12 px-8 font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                          asChild
                        >
                          <Link href={slide.link_url}>{slide.link_text}</Link>
                        </Button>
                      )}
                      {slide.secondary_link_url && slide.secondary_link_text && (
                        <Button
                          size="lg"
                          variant="outline"
                          className="h-12 px-6 font-medium border-2"
                          asChild
                        >
                          <Link href={slide.secondary_link_url}>{slide.secondary_link_text}</Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-7 relative flex justify-center items-center order-1 lg:order-2 min-h-[300px] lg:min-h-[450px]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl opacity-60 transform scale-75"></div>

                    <div className="relative z-10 w-full max-w-[500px] lg:max-w-[600px] h-[300px] lg:h-[450px] flex items-center justify-center">
                      {slide.image_url && (
                        <img
                          src={slide.image_url}
                          alt={slide.title_sk}
                          className="w-full h-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-700"
                        />
                      )}

                      {slideSpecs.length >= 2 && (
                        <>
                          <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-md p-2 rounded-lg shadow-xl border border-border hidden md:block">
                            <div className="text-xs text-muted-foreground uppercase font-bold">
                              {slideSpecs[0].label}
                            </div>
                            <div className="font-bold text-foreground">{slideSpecs[0].value}</div>
                          </div>

                          <div className="absolute bottom-2 left-2 bg-card/90 backdrop-blur-md p-2 rounded-lg shadow-xl border border-border hidden md:block">
                            <div className="text-xs text-muted-foreground uppercase font-bold">
                              {slideSpecs[1].label}
                            </div>
                            <div className="font-bold text-foreground">{slideSpecs[1].value}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activeSlides.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-background transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-background transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {activeSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'w-6 bg-primary'
                    : 'bg-foreground/30 hover:bg-foreground/50'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
