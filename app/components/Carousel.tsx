import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

const Carousel = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goNext = useCallback(() => {
    setCurrent((c) => (images.length === 0 ? 0 : c === images.length - 1 ? 0 : c + 1));
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrent((c) => (images.length === 0 ? 0 : c === 0 ? images.length - 1 : c - 1));
  }, [images.length]);

  // Auto-slide every 5s, paused on hover/touch/interaction
  useEffect(() => {
    if (isPaused || images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      goNext();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, images.length, goNext]);

  if (!images || images.length === 0)
    return (
      <div className="bg-gray-200 w-full h-full flex items-center justify-center">
        No Image
      </div>
    );

  const NextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    goNext();
  };
  const PrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    goPrev();
  };

  // Touch / swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    const threshold = 40;
    if (touchDeltaX.current > threshold) {
      goPrev();
    } else if (touchDeltaX.current < -threshold) {
      goNext();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setIsPaused(false);
  };

  return (
    <div
      className="relative w-full h-56 sm:h-64 md:h-72 group overflow-hidden rounded-2xl touch-pan-y select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        key={current}
        src={`${images[current]}`}
        className="w-full h-full object-cover pointer-events-none animate-fadeIn"
        alt="Preview"
        draggable={false}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={PrevSlide}
            aria-label="Previous slide"
            className="cursor-pointer absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-1.5 sm:p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity active:scale-90"
          >
            <ChevronLeft size={22} className="sm:hidden" />
            <ChevronLeft size={20} className="hidden sm:block" />
          </button>
          <button
            onClick={NextSlide}
            aria-label="Next slide"
            className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-1.5 sm:p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity active:scale-90"
          >
            <ChevronRight size={22} className="sm:hidden" />
            <ChevronRight size={20} className="hidden sm:block" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  current === i ? "bg-blue-500 w-3" : "bg-gray-300"
                } transition-all`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;