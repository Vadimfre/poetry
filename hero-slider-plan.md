# Переработка компонента Hero в слайдер

## 1. Замена компонента Hero на SeasonSlider

Текущий компонент `Hero` находится в `components/Hero/Hero.tsx`. Мы создадим новый компонент `SeasonSlider` и заменим импорт в `app/page.tsx`.

## 2. Создание компонента SeasonSlider

Создать папку `components/SeasonSlider/` с файлами:
- `SeasonSlider.tsx`
- `SeasonSlider.module.css`

### SeasonSlider.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './SeasonSlider.module.css';

const seasons = [
  {
    id: 'winter',
    name: 'Зима',
    description: 'Зимние праздники и стихи о зиме',
    image: '/seasons/winter.jpg', // нужно подготовить изображения
    color: '#4A90E2',
  },
  {
    id: 'spring',
    name: 'Весна',
    description: 'Весенние праздники и стихи о весне',
    image: '/seasons/spring.jpg',
    color: '#50C878',
  },
  {
    id: 'summer',
    name: 'Лето',
    description: 'Летние праздники и стихи о лете',
    image: '/seasons/summer.jpg',
    color: '#FFD700',
  },
  {
    id: 'autumn',
    name: 'Осень',
    description: 'Осенние праздники и стихи об осени',
    image: '/seasons/autumn.jpg',
    color: '#FF8C00',
  },
];

const SeasonSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const router = useRouter();

  // Автопрокрутка каждые 5 секунд
  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === seasons.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [autoplay]);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? seasons.length - 1 : prev - 1));
    setAutoplay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === seasons.length - 1 ? 0 : prev + 1));
    setAutoplay(false);
  };

  const goToSeason = (index: number) => {
    setCurrentIndex(index);
    setAutoplay(false);
  };

  const handleExplore = () => {
    const season = seasons[currentIndex].id;
    router.push(`/calendar?season=${season}`);
  };

  return (
    <section className={styles.slider}>
      <button className={styles.prevButton} onClick={goToPrev} aria-label="Предыдущий сезон">
        ‹
      </button>
      
      <div className={styles.slideContainer}>
        {seasons.map((season, index) => (
          <div
            key={season.id}
            className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
            style={{ backgroundColor: season.color }}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={season.image}
                alt={season.name}
                fill
                className={styles.image}
                priority={index === currentIndex}
              />
              <div className={styles.overlay} />
            </div>
            <div className={styles.content}>
              <h1 className={styles.title}>{season.name}</h1>
              <p className={styles.description}>{season.description}</p>
              <div className={styles.buttons}>
                <button className={styles.primaryButton} onClick={handleExplore}>
                  Смотреть праздники
                </button>
                <button className={styles.secondaryButton} onClick={() => router.push('/poems')}>
                  Все стихи
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.nextButton} onClick={goToNext} aria-label="Следующий сезон">
        ›
      </button>

      <div className={styles.dots}>
        {seasons.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
            onClick={() => goToSeason(index)}
            aria-label={`Перейти к ${seasons[index].name}`}
          />
        ))}
      </div>

      <div className={styles.seasonIndicator}>
        <span className={styles.indicatorText}>
          {currentIndex + 1} / {seasons.length}
        </span>
      </div>
    </section>
  );
};

export default SeasonSlider;
```

### SeasonSlider.module.css

```css
.slider {
  position: relative;
  width: 100%;
  height: 100vh;
  max-height: 800px;
  overflow: hidden;
  background: #000;
}

.slideContainer {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.8s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide.active {
  opacity: 1;
}

.imageWrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image {
  object-fit: cover;
  object-position: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
}

.content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 0 40px;
  color: white;
  text-align: center;
}

.title {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 8px rgba(0,0,0,0.5);
}

.description {
  font-size: 1.5rem;
  margin-bottom: 40px;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.primaryButton {
  background: #fff;
  color: #000;
  border: none;
  padding: 15px 30px;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.primaryButton:hover {
  background: #f0f0f0;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.secondaryButton {
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
  padding: 15px 30px;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.secondaryButton:hover {
  background: rgba(255,255,255,0.1);
  transform: translateY(-3px);
}

.prevButton,
.nextButton {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  font-size: 3rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.prevButton:hover,
.nextButton:hover {
  background: rgba(255,255,255,0.4);
}

.prevButton {
  left: 30px;
}

.nextButton {
  right: 30px;
}

.dots {
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 15px;
  z-index: 10;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}

.dot.active {
  background: white;
  transform: scale(1.2);
}

.dot:hover {
  background: rgba(255,255,255,0.8);
}

.seasonIndicator {
  position: absolute;
  bottom: 40px;
  right: 40px;
  background: rgba(0,0,0,0.5);
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  font-size: 1rem;
  z-index: 10;
}

@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }
  
  .description {
    font-size: 1.2rem;
  }
  
  .buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .primaryButton,
  .secondaryButton {
    width: 100%;
    max-width: 300px;
  }
  
  .prevButton,
  .nextButton {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }
  
  .prevButton {
    left: 15px;
  }
  
  .nextButton {
    right: 15px;
  }
}
```

## 3. Подготовка изображений

Нужно добавить изображения для сезонов в папку `public/seasons/`:
- `winter.jpg`
- `spring.jpg`
- `summer.jpg`
- `autumn.jpg`

Можно использовать временные placeholder-изображения или скачать подходящие.

## 4. Обновление главной страницы

В `app/page.tsx` заменить импорт Hero на SeasonSlider:

```tsx
import Header from '@/components/Header/Header';
import SeasonSlider from '@/components/SeasonSlider/SeasonSlider'; // новый компонент
import PromoSection from '@/components/PromoSection/PromoSection';
import AboutBelarusSection from '@/components/AboutBelarusSection/AboutBelarusSection';
import AuthorsSection from '@/components/AuthorsSection/AuthorsSection';
import AllAuthorsSection from '@/components/AllAuthorsSection/AllAuthorsSection';
import CardsSlider from '@/components/CardsSlider/CardsSlider';

export default function Home() {
  return (
    <main>
      <Header />
      <SeasonSlider />
      <PromoSection />
      <AboutBelarusSection />
      <AuthorsSection />
      <AllAuthorsSection />
      <CardsSlider />
    </main>
  );
}
```

## 5. Удаление старого компонента Hero (опционально)

Если компонент Hero больше не нужен, можно удалить папку `components/Hero/` или оставить как резерв.

## 6. Проверка

После внесения изменений проверить, что слайдер работает корректно:
- Переключение стрелками
- Автопрокрутка
- Клик на точки
- Кнопки ведут на правильные страницы

## 7. Следующие шаги

После реализации слайдера перейти к созданию страницы календаря (`/calendar`) и компонента SeasonCalendar.