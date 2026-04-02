"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header/Header";
import styles from "./faq.module.css";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "Общие вопросы",
    question: "Что такое Poetry?",
    answer:
      "Poetry — это онлайн-платформа для чтения и наслаждения поэзией. Мы собрали обширную коллекцию стихотворений классических и современных авторов, чтобы вы могли открывать для себя новые произведения и перечитывать любимые.",
  },
  {
    category: "Общие вопросы",
    question: "Как пользоваться сайтом?",
    answer:
      "Всё очень просто! На главной странице вы найдёте категории стихов. Выберите интересующую вас категорию, затем коллекцию, и откройте любое стихотворение. Вы также можете использовать поиск для быстрого нахождения произведений.",
  },
  {
    category: "Общие вопросы",
    question: "Сайт бесплатный?",
    answer:
      "Да, Poetry полностью бесплатен! Вы можете читать все стихотворения без каких-либо ограничений и подписок.",
  },
  {
    category: "Аккаунт",
    question: "Зачем нужна регистрация?",
    answer:
      "Регистрация позволяет сохранять стихотворения в избранное, оставлять комментарии и получать персональные рекомендации. Без регистрации вы также можете читать все стихи, но без дополнительных функций.",
  },
  {
    category: "Аккаунт",
    question: "Как изменить данные профиля?",
    answer:
      'После входа в аккаунт нажмите на своё имя в правом верхнем углу и выберите "Настройки профиля". Там вы можете изменить имя, email и пароль.',
  },
  {
    category: "Аккаунт",
    question: "Забыл пароль, что делать?",
    answer:
      "На данный момент функция восстановления пароля находится в разработке. Пожалуйста, свяжитесь с нами через форму обратной связи для решения этой проблемы.",
  },
  {
    category: "Функции",
    question: 'Что такое "Избранное"?',
    answer:
      'Избранное — это ваша персональная коллекция понравившихся стихотворений. Нажмите на иконку сердечка на странице стиха, чтобы добавить его в избранное. Все сохранённые стихи доступны в разделе "Избранное" в меню профиля.',
  },
  {
    category: "Функции",
    question: "Как работают комментарии?",
    answer:
      "Под каждым стихотворением есть раздел комментариев. Нажмите на иконку комментариев, чтобы увидеть обсуждение или добавить свой отзыв. Для комментирования необходима регистрация.",
  },
  {
    category: "Функции",
    question: "Что за видео на фоне стихов?",
    answer:
      "Некоторые стихотворения сопровождаются атмосферными видеороликами, которые создают настроение и помогают глубже погрузиться в произведение. Вы можете поставить видео на паузу или выключить звук.",
  },
  {
    category: "Контент",
    question: "Как вы выбираете стихотворения?",
    answer:
      "Наша команда тщательно отбирает произведения, учитывая их литературную ценность, популярность и актуальность. Мы стремимся представить разнообразие поэтических направлений и эпох.",
  },
  {
    category: "Контент",
    question: "Могу ли я предложить стихотворение?",
    answer:
      "Да! Мы всегда рады предложениям. Свяжитесь с нами через форму обратной связи и укажите название произведения и автора. Мы рассмотрим вашу заявку.",
  },
];

const categories = ["Все", "Общие вопросы", "Аккаунт", "Функции", "Контент"];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("Все");

  const filteredFAQ =
    activeCategory === "Все"
      ? faqData
      : faqData.filter((item) => item.category === activeCategory);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Header />
      <div className={styles.page}>
        {/* Декоративные элементы */}
        <div className={styles.decorations}>
          {/* Левая сторона */}
          <div className={styles.decorLeft}>
            <div className={styles.floatingQuote}>&#34;</div>
            <div className={styles.decorLine}></div>
            <div className={styles.decorDot}></div>
            <div className={styles.decorDot}></div>
            <div className={styles.decorDot}></div>
            <div className={styles.decorCircle}></div>
            <div className={styles.floatingFeather}>✒</div>
          </div>

          {/* Правая сторона */}
          <div className={styles.decorRight}>
            <div className={styles.decorStar}>✦</div>
            <div className={styles.decorLine}></div>
            <div className={styles.decorRing}></div>
            <div className={styles.decorDot}></div>
            <div className={styles.decorDot}></div>
            <div className={styles.floatingBook}>📖</div>
            <div className={styles.decorCross}>+</div>
          </div>
        </div>

        {/* Hero */}
        <section className={styles.hero}>
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className={styles.badge}>FAQ</span>
            <h1 className={styles.title}>Вопросы и ответы</h1>
            <p className={styles.subtitle}>
              Здесь вы найдёте ответы на самые популярные вопросы о нашем
              сервисе
            </p>
          </motion.div>
        </section>

        {/* Categories */}
        <section className={styles.categories}>
          <div className={styles.categoriesWrapper}>
            {categories.map((category) => (
              <button
                key={category}
                className={`${styles.categoryButton} ${activeCategory === category ? styles.categoryActive : ""}`}
                onClick={() => {
                  setActiveCategory(category);
                  setOpenIndex(null);
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* FAQ List */}
        <section className={styles.faqSection}>
          <div className={styles.faqList}>
            {filteredFAQ.map((item, index) => (
              <motion.div
                key={index}
                className={styles.faqItem}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <button
                  className={`${styles.faqQuestion} ${openIndex === index ? styles.faqQuestionOpen : ""}`}
                  onClick={() => toggleQuestion(index)}
                >
                  <span className={styles.questionText}>{item.question}</span>
                  <span className={styles.toggleIcon}>
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      className={styles.faqAnswer}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p>{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className={styles.linksSection}>
          <h3 className={styles.linksTitle}>Полезные ссылки</h3>
          <div className={styles.linksGrid}>
            <Link href="/" className={styles.linkCard}>
              <span className={styles.linkIcon}>🏠</span>
              <span className={styles.linkText}>Главная</span>
            </Link>
            <Link href="/about" className={styles.linkCard}>
              <span className={styles.linkIcon}>ℹ️</span>
              <span className={styles.linkText}>О нас</span>
            </Link>
            <Link href="/favorites" className={styles.linkCard}>
              <span className={styles.linkIcon}>❤️</span>
              <span className={styles.linkText}>Избранное</span>
            </Link>
            <Link href="/settings" className={styles.linkCard}>
              <span className={styles.linkIcon}>⚙️</span>
              <span className={styles.linkText}>Настройки</span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
