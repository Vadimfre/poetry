"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Hero.module.css";
import SeasonSlider from "../SeasonSlider/SeasonSlider";

const Hero = () => {
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
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            БЕЛАРУСКАЯ ПАЭЗІЯ
            <br />
            ДЛЯ ДУШЫ І СЭРЦА
          </h1>

          <p className={styles.subtitle}>
            ВЕРШЫ АД ВЯЛІКІХ БЕЛАРУСКІХ ПАЭТАЎ ПАД ЛЮБЫ
            <br />
            НАСТРОЙ І ТЭМУ. ЗНАЙДЗІЦЕ ВЕРШ ДЛЯ СЯБЕ
          </p>

          <div className={styles.bottomSection}>
            {/* Левые теги */}
            <div className={styles.categoriesLeft}>
              <div className={styles.categoryTag}># ЯНКА КУПАЛА</div>
              <div className={styles.categoryTag}># ЯКУБ КОЛАС</div>
            </div>

            {/* Кнопка в центре */}
            <button className={styles.button} onClick={handleViewPoems}>
              ГЛЯДЗЕЦЬ ВЕРШЫ
            </button>

            {/* Правые теги */}
            <div className={styles.categoriesRight}>
              <div className={styles.categoryTag}># БАГДАНОВІЧ</div>
              <div className={styles.categoryTag}># КЛАСІКІ</div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div
          className={`${styles.imageContainer} ${imageLoaded ? styles.imageLoaded : ""}`}
        >
          <div className={styles.imageWrapper}>
            {/* <Image 
              src="/images/seasons/winter.jpg"
              alt="Poetry illustration"
              fill
              priority
              onLoad={() => setImageLoaded(true)}
            /> */}
            <SeasonSlider />
          </div>
          {/* Декоративные элементы */}
          <div className={styles.imageDecor1}></div>
          <div className={styles.imageDecor2}></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
