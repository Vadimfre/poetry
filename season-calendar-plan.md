# Разработка компонента календаря для каждого сезона

## 1. Создание страницы календаря

Создать страницу `app/calendar/page.tsx`, которая будет отображать календарь праздников с возможностью фильтрации по сезону.

## 2. Структура страницы

Страница будет содержать:
- Заголовок
- Переключатель сезонов (табы: Зима, Весна, Лето, Осень)
- Компонент `SeasonCalendar`, который показывает праздники выбранного сезона в виде сетки карточек.
- Возможно, мини-календарь с отметками дат.

## 3. Компонент SeasonCalendar

Создать `components/SeasonCalendar/SeasonCalendar.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useHolidays } from '@/src/features/holidays/model/use-holidays';
import { Season } from '@/src/shared/types/holiday.types';
import HolidayCard from './HolidayCard';
import styles from './SeasonCalendar.module.css';

interface SeasonCalendarProps {
  initialSeason?: Season;
}

const SeasonCalendar = ({ initialSeason = Season.WINTER }: SeasonCalendarProps) => {
  const [selectedSeason, setSelectedSeason] = useState<Season>(initialSeason);
  const { data: holidays, isLoading, error } = useHolidays(selectedSeason);

  const seasons = [
    { value: Season.WINTER, label: '❄️ Зима' },
    { value: Season.SPRING, label: '🌱 Весна' },
    { value: Season.SUMMER, label: '☀️ Лето' },
    { value: Season.AUTUMN, label: '🍂 Осень' },
  ];

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка праздников...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Не удалось загрузить праздники. Попробуйте позже.</p>
      </div>
    );
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.seasonTabs}>
        {seasons.map((season) => (
          <button
            key={season.value}
            className={`${styles.tab} ${selectedSeason === season.value ? styles.active : ''}`}
            onClick={() => setSelectedSeason(season.value)}
          >
            {season.label}
          </button>
        ))}
      </div>

      <div className={styles.header}>
        <h2>Праздники {selectedSeason.toLowerCase()}</h2>
        <p className={styles.subtitle}>
          Нажмите на праздник, чтобы увидеть стихи по этой теме
        </p>
      </div>

      {holidays && holidays.length > 0 ? (
        <div className={styles.grid}>
          {holidays.map((holiday) => (
            <HolidayCard key={holiday.id} holiday={holiday} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>Праздников для этого сезона пока нет.</p>
        </div>
      )}
    </div>
  );
};

export default SeasonCalendar;
```

## 4. Компонент HolidayCard

Создать `components/SeasonCalendar/HolidayCard.tsx`:

```tsx
import { Holiday } from '@/src/shared/types/holiday.types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './SeasonCalendar.module.css';

interface HolidayCardProps {
  holiday: Holiday;
}

const HolidayCard = ({ holiday }: HolidayCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/calendar/${holiday.slug}`);
  };

  const date = new Date(holiday.date);
  const formattedDate = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.cardImage}>
        {holiday.image ? (
          <Image
            src={holiday.image}
            alt={holiday.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.placeholderImage} style={{ backgroundColor: getSeasonColor(holiday.season) }}>
            <span className={styles.placeholderText}>{holiday.name.charAt(0)}</span>
          </div>
        )}
        <div className={styles.cardOverlay} />
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardDate}>{formattedDate}</div>
        <h3 className={styles.cardTitle}>{holiday.name}</h3>
        <p className={styles.cardDescription}>{holiday.description}</p>
        <button className={styles.cardButton}>Смотреть стихи</button>
      </div>
    </div>
  );
};

function getSeasonColor(season: string): string {
  switch (season) {
    case 'WINTER': return '#4A90E2';
    case 'SPRING': return '#50C878';
    case 'SUMMER': return '#FFD700';
    case 'AUTUMN': return '#FF8C00';
    default: return '#6c757d';
  }
}

export default HolidayCard;
```

## 5. Стили для SeasonCalendar

Создать `components/SeasonCalendar/SeasonCalendar.module.css`:

```css
.calendar {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.seasonTabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.tab {
  padding: 12px 24px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab:hover {
  border-color: #888;
}

.tab.active {
  background: #333;
  color: white;
  border-color: #333;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h2 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-transform: capitalize;
}

.subtitle {
  color: #666;
  font-size: 1.2rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
}

.cardImage {
  position: relative;
  height: 200px;
  width: 100%;
}

.image {
  object-fit: cover;
}

.placeholderImage {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 4rem;
  font-weight: bold;
}

.placeholderText {
  opacity: 0.7;
}

.cardOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%);
}

.cardContent {
  padding: 20px;
}

.cardDate {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 5px;
}

.cardTitle {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #333;
}

.cardDescription {
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cardButton {
  background: #333;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.cardButton:hover {
  background: #555;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  border: 4px solid rgba(0,0,0,0.1);
  border-left-color: #333;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 40px;
  background: #ffe6e6;
  border-radius: 8px;
  color: #c00;
}

.empty {
  text-align: center;
  padding: 60px 20px;
  background: #f9f9f9;
  border-radius: 12px;
  color: #888;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .header h2 {
    font-size: 2rem;
  }
  
  .seasonTabs {
    gap: 5px;
  }
  
  .tab {
    padding: 10px 20px;
    font-size: 1rem;
  }
}
```

## 6. Страница календаря

Создать `app/calendar/page.tsx`:

```tsx
import SeasonCalendar from '@/components/SeasonCalendar/SeasonCalendar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Календарь праздников | Белорусская поэзия',
  description: 'Праздники и события, связанные с белорусской поэзией. Стихи по темам праздников.',
};

export default function CalendarPage() {
  return (
    <div>
      <header className="page-header">
        <h1>Календарь поэтических праздников</h1>
        <p>
          Откройте для себя праздники и события, вдохновляющие белорусских поэтов.
          Выберите сезон, чтобы увидеть соответствующие праздники.
        </p>
      </header>
      <SeasonCalendar />
    </div>
  );
}
```

## 7. Добавление CSS для page-header

Добавить в `app/calendar/calendar.module.css` (или использовать глобальные стили):

```css
.page-header {
  text-align: center;
  padding: 60px 20px 40px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #333;
}

.page-header p {
  font-size: 1.2rem;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2.2rem;
  }
  
  .page-header p {
    font-size: 1rem;
  }
}
```

## 8. Навигация от слайдера к календарю

В компоненте `SeasonSlider` кнопка "Смотреть праздники" должна вести на `/calendar?season=winter` (с параметром сезона). Нужно обновить `SeasonSlider.tsx`:

```tsx
const handleExplore = () => {
  const season = seasons[currentIndex].id;
  router.push(`/calendar?season=${season}`);
};
```

## 9. Обработка параметра сезона на странице календаря

Модифицировать `SeasonCalendar` для чтения query параметра из URL. Использовать `useSearchParams`:

```tsx
'use client';

import { useSearchParams } from 'next/navigation';
// ...

const SeasonCalendar = ({ initialSeason = Season.WINTER }: SeasonCalendarProps) => {
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get('season')?.toUpperCase();
  const validSeason = Object.values(Season).includes(seasonParam as Season)
    ? (seasonParam as Season)
    : initialSeason;
  const [selectedSeason, setSelectedSeason] = useState<Season>(validSeason);
  // ...
};
```

## 10. Следующие шаги

1. Создать компоненты и страницы согласно плану.
2. Интегрировать с API праздников.
3. Протестировать.