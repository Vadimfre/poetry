'use client'

import { useState, useEffect, useRef } from 'react'
import { useI18n } from '@/src/shared/i18n/context'
import styles from './AboutBelarusSection.module.css'

const AboutBelarusSection = () => {
  const { t } = useI18n()
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  const features = [
    {
      icon: '🇧🇾',
      titleKey: 'aboutBelarus.feature1Title',
      textKey: 'aboutBelarus.feature1Text',
    },
    {
      icon: '📜',
      titleKey: 'aboutBelarus.feature2Title',
      textKey: 'aboutBelarus.feature2Text',
    },
    {
      icon: '🎭',
      titleKey: 'aboutBelarus.feature3Title',
      textKey: 'aboutBelarus.feature3Text',
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className={styles.aboutSection}>
      <div className="container">
        <div className={`${styles.contentWrapper} ${isVisible ? styles.visible : ''}`}>
          <div className={styles.textColumn}>
            <span className={styles.label}>{t('aboutBelarus.label')}</span>
            <h2 className={styles.title}>{t('aboutBelarus.title')}</h2>
            <p className={styles.description}>{t('aboutBelarus.description1')}</p>
            <p className={styles.description}>{t('aboutBelarus.description2')}</p>

            <div className={styles.quote}>
              <span className={styles.quoteIcon}>❝</span>
              <blockquote>{t('aboutBelarus.quote')}</blockquote>
              <cite>{t('aboutBelarus.quoteAuthor')}</cite>
            </div>
          </div>

          <div className={styles.featuresColumn}>
            {features.map((feature, index) => (
              <div
                key={feature.titleKey}
                className={styles.featureCard}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h3 className={styles.featureTitle}>{t(feature.titleKey)}</h3>
                <p className={styles.featureDescription}>{t(feature.textKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutBelarusSection
