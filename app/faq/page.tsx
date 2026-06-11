"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header/Header";
import { useI18n } from "@/src/shared/i18n";
import { useFaqContent, type FaqCategory } from "@/src/shared/i18n/use-faq-content";
import styles from "./faq.module.css";

const CATEGORY_ORDER: (FaqCategory | "all")[] = [
  "all",
  "general",
  "account",
  "features",
  "content",
];

export default function FAQPage() {
  const { t } = useI18n();
  const { categories, items } = useFaqContent();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<FaqCategory | "all">("all");

  const filteredFAQ =
    activeCategory === "all"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getCategoryLabel = (key: FaqCategory | "all") =>
    key === "all" ? t("faq.all") : categories[key];

  const quickLinks = [
    { href: "/", icon: "🏠", label: t("faq.linkHome") },
    { href: "/about", icon: "ℹ️", label: t("faq.linkAbout") },
    { href: "/favorites", icon: "❤️", label: t("faq.linkFavorites") },
    { href: "/settings", icon: "⚙️", label: t("faq.linkSettings") },
  ];

  return (
    <>
      <Header />
      <div className={styles.page}>
        <div className={styles.decorations}>
          <div className={styles.decorLeft}>
            <div className={styles.floatingQuote}>&#34;</div>
            <div className={styles.decorLine}></div>
            <div className={styles.decorDot}></div>
            <div className={styles.decorDot}></div>
            <div className={styles.decorDot}></div>
            <div className={styles.decorCircle}></div>
            <div className={styles.floatingFeather}>✒</div>
          </div>
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

        <section className={styles.hero}>
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className={styles.badge}>FAQ</span>
            <h1 className={styles.title}>{t("faq.title")}</h1>
            <p className={styles.subtitle}>{t("faq.subtitle")}</p>
          </motion.div>
        </section>

        <section className={styles.categories}>
          <div className={styles.categoriesWrapper}>
            {CATEGORY_ORDER.map((category) => (
              <button
                key={category}
                type="button"
                className={`${styles.categoryButton} ${activeCategory === category ? styles.categoryActive : ""}`}
                onClick={() => {
                  setActiveCategory(category);
                  setOpenIndex(null);
                }}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.faqSection}>
          <div className={styles.faqList}>
            {filteredFAQ.map((item, index) => (
              <motion.div
                key={`${item.category}-${item.question}`}
                className={styles.faqItem}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <button
                  type="button"
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

        <section className={styles.linksSection}>
          <h3 className={styles.linksTitle}>{t("faq.usefulLinks")}</h3>
          <div className={styles.linksGrid}>
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.linkCard}>
                <span className={styles.linkIcon}>{link.icon}</span>
                <span className={styles.linkText}>{link.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
