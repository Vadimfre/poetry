"use client";

import { useEffect, useRef, useState } from "react";
import { LOCALES, useI18n, type Locale } from "@/src/shared/i18n";
import styles from "./LanguageSelect.module.css";

export function LanguageSelect() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: Locale) => {
    setLocale(value);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language.label")}
      >
        <svg
          className={styles.globe}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{current.short}</span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          viewBox="0 0 12 12"
          fill="currentColor"
          aria-hidden
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className={styles.menu} role="listbox" aria-label={t("language.label")}>
          {LOCALES.map((item) => (
            <button
              key={item.value}
              type="button"
              role="option"
              aria-selected={locale === item.value}
              className={`${styles.option} ${locale === item.value ? styles.optionActive : ""}`}
              onClick={() => handleSelect(item.value)}
            >
              <span>{item.label}</span>
              <span className={styles.optionShort}>{item.short}</span>
              {locale === item.value && (
                <svg
                  className={styles.check}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  aria-hidden
                >
                  <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
