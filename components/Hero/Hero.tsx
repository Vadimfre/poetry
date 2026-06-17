"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Hero.module.css";
import SeasonSlider from "../SeasonSlider/SeasonSlider";
import { useI18n } from "@/src/shared/i18n";

const Hero = () => {
  const { t } = useI18n();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Небольшая задержка для плавного появления
    const timer = setTimeout(() => {
      setImageLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleViewPoems = () => {
    // Плавный скролл к секции с категориями
    const categoriesSection = document.getElementById("categories");
    if (categoriesSection) {
      categoriesSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroLayout}>
          <div className={styles.sideDecor} aria-hidden="true">
            <Image
              src="/images/decor/stork-left.png"
              alt=""
              width={220}
              height={320}
              className={styles.sideStork}
              priority
            />
            <Image
              src="/images/decor/ornament.svg"
              alt=""
              width={80}
              height={80}
              className={styles.sideOrnament}
            />
          </div>

        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            {t("hero.titleLine1")}
            <br />
            {t("hero.titleLine2")}
          </h1>

          <p className={styles.subtitle}>
            {t("hero.subtitleLine1")}
            <br />
            {t("hero.subtitleLine2")}
          </p>

          <div className={styles.bottomSection}>
            {/* Левые теги */}
            <div className={styles.categoriesLeft}>
              <div className={styles.categoryTag}>{t("hero.tagKupala")}</div>
              <div className={styles.categoryTag}>{t("hero.tagKolas")}</div>
            </div>

            {/* Кнопка в центре */}
            <button className={styles.button} onClick={handleViewPoems}>
              {t("hero.cta")}
            </button>

            {/* Правые теги */}
            <div className={styles.categoriesRight}>
              <div className={styles.categoryTag}>{t("hero.tagBahdanovich")}</div>
              <div className={styles.categoryTag}>{t("hero.tagClassics")}</div>
            </div>
          </div>
        </div>

          <div className={styles.sideDecor} aria-hidden="true">
            <Image
              src="/images/decor/ornament.svg"
              alt=""
              width={80}
              height={80}
              className={styles.sideOrnament}
            />
            <Image
              src="/images/decor/stork-right.png"
              alt=""
              width={220}
              height={320}
              className={styles.sideStork}
              priority
            />
          </div>
        </div>

        {/* Hero Image */}
        <div
          className={`${styles.imageContainer} ${imageLoaded ? styles.imageLoaded : ""}`}
        >
          <SeasonSlider />
          <div className={styles.imageDecor1}></div>
          <div className={styles.imageDecor2}></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
