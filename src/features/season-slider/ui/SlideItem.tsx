"use client";

import Image from "next/image";
import styles from "@/components/SeasonSlider/SeasonSlider.module.css";

interface Slide {
  id: number;
  src: string;
  alt: string;
  subtitle: string;
  title: string;
  season: string;
}

interface SlideItemProps {
  slide: Slide;
  isActive: boolean;
}

export default function SlideItem({ slide, isActive }: SlideItemProps) {
  return (
    <div className={`${styles.slide} ${isActive ? styles.active : ""}`}>
      <Image
        src={slide.src}
        alt={slide.alt}
        width={1920}
        height={1080}
        className={styles.image}
      />
      <div className={styles.overlay} />

      <div className={styles.slideContent}>
        <div className={styles.content}>
          <span className={styles.subtitle}>{slide.subtitle}</span>
          <h2 className={styles.title}>{slide.title}</h2>
        </div>
      </div>
    </div>
  );
}
