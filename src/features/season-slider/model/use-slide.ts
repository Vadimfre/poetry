import { useCallback, useEffect, useState } from "react";

export const useSlider = (
  slidesLength: number,
  initialIndex = 0,
  autoPlayInterval = 5500,
  resetKey?: unknown,
) => {
  const [currentSlide, setCurrentSlide] = useState(initialIndex);

  useEffect(() => {
    setCurrentSlide(initialIndex);
  }, [initialIndex, slidesLength, resetKey]);

  const nextSlide = useCallback(() => {
    if (slidesLength === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slidesLength);
  }, [slidesLength]);

  const prevSlide = () => {
    if (slidesLength === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slidesLength) % slidesLength);
  };

  useEffect(() => {
    if (slidesLength <= 1) return;
    const timer = setInterval(() => nextSlide(), autoPlayInterval);
    return () => clearInterval(timer);
  }, [slidesLength, autoPlayInterval, nextSlide]);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slidesLength) {
      setCurrentSlide(index);
    }
  };

  return {
    currentSlide,
    nextSlide,
    prevSlide,
    goToSlide,
  };
};
