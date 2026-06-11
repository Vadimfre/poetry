'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Header from '@/components/Header/Header'
import { useAboutContent } from '@/src/shared/i18n/use-about-content'
import styles from './about.module.css'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function AboutPage() {
  const c = useAboutContent()

  const stats = [
    { number: '500+', label: c.statPoems },
    { number: '100+', label: c.statAuthors },
    { number: '10K+', label: c.statReaders },
    { number: '50+', label: c.statCollections },
  ]

  const teamMembers = [
    {
      name: c.member1Name,
      role: c.member1Role,
      avatar: c.member1Name.charAt(0),
      description: c.member1Desc,
    },
    {
      name: c.member2Name,
      role: c.member2Role,
      avatar: c.member2Name.charAt(0),
      description: c.member2Desc,
    },
  ]

  const missions = [
    { icon: '📚', title: c.mission1Title, text: c.mission1Text },
    { icon: '🎨', title: c.mission2Title, text: c.mission2Text },
    { icon: '🌍', title: c.mission3Title, text: c.mission3Text },
  ]

  return (
    <>
      <Header />
      <div className={styles.page}>
        <section className={styles.hero}>
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className={styles.badge}>{c.badge}</span>
            <h1 className={styles.heroTitle}>
              {c.heroTitle}
              <span className={styles.highlight}>{c.heroTitleHighlight}</span>
            </h1>
            <p className={styles.heroSubtitle}>{c.heroSubtitle}</p>
          </motion.div>
          <div className={styles.heroDecor}>
            <motion.div className={styles.decorCircle} />
            <div className={styles.decorCircle2} />
          </div>
        </section>

        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className={styles.statCard}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <span className={styles.statNumber}>{stat.number}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section className={styles.missionSection}>
          <motion.div className={styles.missionContent} {...fadeInUp}>
            <h2 className={styles.sectionTitle}>{c.missionTitle}</h2>
            <div className={styles.missionGrid}>
              {missions.map((mission) => (
                <div key={mission.title} className={styles.missionCard}>
                  <div className={styles.missionIcon}>{mission.icon}</div>
                  <h3>{mission.title}</h3>
                  <p>{mission.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className={styles.teamSection}>
          <h2 className={styles.sectionTitle}>{c.teamTitle}</h2>
          <p className={styles.sectionSubtitle}>{c.teamSubtitle}</p>
          <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
              <motion.div
                key={`${member.name}-${member.role}`}
                className={styles.teamCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
              >
                <motion.div className={styles.teamAvatar}>{member.avatar}</motion.div>
                <h3 className={styles.teamName}>{member.name}</h3>
                <span className={styles.teamRole}>{member.role}</span>
                <p className={styles.teamDesc}>{member.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className={styles.ctaSection}>
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={styles.ctaTitle}>{c.ctaTitle}</h2>
            <p className={styles.ctaText}>{c.ctaText}</p>
            <Link href="/" className={styles.ctaButton}>
              {c.ctaButton}
            </Link>
          </motion.div>
        </section>
      </div>
    </>
  )
}
