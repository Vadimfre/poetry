"use client";

import styles from "./SeasonSlider.module.css";
import { useSeasonSlides } from "@/src/features/season-slider/model/use-season-slides";
import { useSlider } from "@/src/features/season-slider/model/use-slide";
import DotsNavigation from "@/src/features/season-slider/ui/DotsNavigation";
import NavigationArrows from "@/src/features/season-slider/ui/NavigationArrows";
import ProgressBar from "@/src/features/season-slider/ui/ProgressBar";
import { SeasonSlide } from "@/src/features/season-slider/ui/SeasonSlide";
import { useState } from "react";

export default function SeasonSlider() {
  const { data: slides, isLoading } = useSeasonSlides();

  const { currentSlide, nextSlide, prevSlide, goToSlide } = useSlider(
    slides?.length || 0,
  );

  if (isLoading) {
    return (
      <div className={styles.slider}>
        <div className={styles.loading}>Загрузка слайдов...</div>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className={styles.slider}>
        <div className={styles.empty}>Нет доступных слайдов</div>
      </div>
    );
  }

  return (
    <div className={styles.slider}>
      <div className={styles.slidesContainer}>
        {slides.map((slide, index) => (
          <SeasonSlide
            key={slide.id}
            slide={slide}
            isActive={index === currentSlide}
          />
        ))}
      </div>

      <NavigationArrows onNext={nextSlide} onPrev={prevSlide} />

      <DotsNavigation
        slidesLength={slides.length}
        current={currentSlide}
        onDotClick={goToSlide}
      />

      <ProgressBar
        progress={
          slides.length === 1
            ? 1
            : slides.length > 1
              ? currentSlide / (slides.length - 1)
              : 0
        }
      />
    </div>
  );
}
