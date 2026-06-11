import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import PromoSection from "@/components/PromoSection/PromoSection";
import AboutBelarusSection from "@/components/AboutBelarusSection/AboutBelarusSection";
import FeaturedPoemsSection from "@/components/FeaturedPoemsSection/FeaturedPoemsSection";
import AllAuthorsSection from "@/components/AllAuthorsSection/AllAuthorsSection";
import CardsSlider from "@/components/CardsSlider/CardsSlider";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.home}>
      <div className={styles.backgroundGlowTop} />
      <div className={styles.backgroundGlowBottom} />
      <div className={styles.shell}>
        <Header />
        <section className={styles.heroSection}>
          <Hero />
        </section>
        <section className={styles.contentSection}>
          <div className={styles.featureStack}>
            <PromoSection />
            <AboutBelarusSection />
          </div>
        </section>
        <section className={styles.contentSection}>
          <div className={styles.featureCardWide}>
            <FeaturedPoemsSection />
          </div>
        </section>
        <section className={styles.contentSection}>
          <div className={styles.featureCardWide}>
            <AllAuthorsSection />
          </div>
        </section>
        <section className={styles.contentSection}>
          <div className={styles.featureCardWide}>
            <CardsSlider />
          </div>
        </section>
      </div>
      <ScrollToTop />
    </main>
  );
}
