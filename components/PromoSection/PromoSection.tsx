"use client";

import { BookOpen, Sparkles, Users } from "lucide-react";

import { useI18n, usePlural } from "@/src/shared/i18n/context";
import styles from "./PromoSection.module.css";

const PROMO_POEM_COUNT = 200;

const PromoSection = () => {
  const { t } = useI18n();
  const plural = usePlural();
  const poemWord = plural(PROMO_POEM_COUNT, {
    one: "common.verseOne",
    few: "common.verseFew",
    many: "common.verseMany",
  });

  return (
    <section className={styles.promoSection}>
      <div className="container">
        <div className={styles.card}>
          <span className={styles.dot} data-position="top-left" />
          <span className={styles.dot} data-position="top-right" />
          <span className={styles.dot} data-position="bottom-left" />
          <span className={styles.dot} data-position="bottom-right" />

          <div className={styles.bgOrnament} aria-hidden="true" />

          <div className={styles.grid}>
            <div className={styles.left}>
              <div className={styles.badgeRow}>
                <span className={styles.badge}>
                  <Sparkles className={styles.badgeIcon} />
                  {t("promoHome.badge")}
                </span>
              </div>

              <h2 className={styles.title}>
                {t("promoHome.titleMore")} {PROMO_POEM_COUNT} {poemWord}
              </h2>

              <p className={styles.description}>
                <span className={styles.brand}>{t("promoHome.brand")}</span>{" "}
                {t("promoHome.description")}
              </p>

              <ul className={styles.features}>
                <li className={styles.featureItem}>
                  <BookOpen className={styles.featureIcon} />
                  {t("promoHome.feature1")}
                </li>
                <li className={styles.featureItem}>
                  <Users className={styles.featureIcon} />
                  {t("promoHome.feature2")}
                </li>
                <li className={styles.featureItem}>
                  <Sparkles className={styles.featureIcon} />
                  {t("promoHome.feature3")}
                </li>
              </ul>
            </div>

            <div className={styles.right}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>200+</div>
                  <div className={styles.statLabel}>
                    {t("promoHome.statPoems")}
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>BE</div>
                  <div className={styles.statLabel}>
                    {t("promoHome.statLang")}
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>24/7</div>
                  <div className={styles.statLabel}>
                    {t("promoHome.statAccess")}
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>♥</div>
                  <div className={styles.statLabel}>
                    {t("promoHome.statFavorites")}
                  </div>
                </div>
              </div>

              <div className={styles.quoteCard}>
                <div className={styles.quoteMark}>“</div>
                <p className={styles.quoteText}>{t("promoHome.quote")}</p>
                <div className={styles.quoteFooter}>
                  {t("promoHome.quoteFooter")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoSection;
