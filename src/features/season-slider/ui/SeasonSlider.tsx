"use client";

import styles from "@/components/SeasonSlider/SeasonSlider.module.css";
import { useSlider } from "../model/use-slide";
import NavigationArrows from "./NavigationArrows";
import DotsNavigation from "./DotsNavigation";
import ProgressBar from "./ProgressBar";
import { SeasonSlide } from "./SeasonSlide";
import { useSeasonSlides } from "../model/use-season-slides";

export default function SeasonSlider() {
  const { data: slides, isLoading } = useSeasonSlides();

  const { currentSlide, nextSlide, prevSlide, goToSlide } = useSlider(slides?.length || 0);

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
