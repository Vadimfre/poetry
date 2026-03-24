import { useState } from "react";

export const useSlider = (slidesLength: number, initialIndex = 0) => {
  const [currentSlide, setCurrentSlide] = useState(initialIndex);

  const nextSlide = () => {
    if (slidesLength === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slidesLength);
  };

  const prevSlide = () => {
    if (slidesLength === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slidesLength) % slidesLength);
  };

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
