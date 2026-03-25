"use client"

import Image from "next/image"
import { Heart, MessageCircle, Calendar, Star } from "lucide-react"
import { DialogHeader } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Holiday, Season } from "@/src/shared"
import { MONTH_NAMES } from "../../season-slider/season-slider-data"
import styles from "./hero-section.module.css"

interface HeroSectionProps {
  holiday: Holiday
}

export function HeroSection({ holiday }: HeroSectionProps) {
  return (
    <div className={styles.container}>
      <HeroBackground image={holiday.image} name={holiday.name} />
      
      <div className={styles.content}>
        <Badge className={styles.badge}>
          <Star className={styles.badgeIcon} />
          {Season[holiday.season]}
        </Badge>

        <div className={styles.dateContainer}>
          <div className={styles.dateIconWrapper}>
            <Calendar className={styles.dateIcon} />
          </div>
          <span className={styles.dateText}>
            {holiday.day} {MONTH_NAMES[holiday.month - 1]}
          </span>
        </div>

        <DialogHeader className="text-left">
          <h2 className={styles.title}>
            {holiday.name}
          </h2>
          
          {holiday.description && (
            <p className={styles.description}>
              {holiday.description}
            </p>
          )}
        </DialogHeader>

        <HeroStats 
          favorites={holiday._count?.favorites ?? 0} 
          comments={holiday._count?.comments ?? 0} 
        />
      </div>
    </div>
  )
}

function HeroBackground({ image, name }: { image?: string; name: string }) {
  if (image) {
    return (
      <>
        <Image
          src={image}
          alt={name}
          fill
          className={styles.backgroundImage}
          loading="eager"
          priority
        />
        <div className={styles.gradientRight} />
        <div className={styles.gradientTop} />
      </>
    )
  }

  return (
    <div className={styles.fallbackBackground}>
      <div className={styles.fallbackPattern}>
        <div className={styles.pulseCircle1} />
        <div className={styles.pulseCircle2} style={{ animationDelay: '1s' }} />
      </div>
    </div>
  )
}

function HeroStats({ favorites, comments }: { favorites: number; comments: number }) {
  return (
    <div className={styles.statsContainer}>
      <div className={styles.statItem}>
        <Heart className={`${styles.statIcon} ${styles.statIconHeart}`} />
        <span className={styles.statValue}>{favorites}</span>
      </div>
      <div className={styles.statItem}>
        <MessageCircle className={`${styles.statIcon} ${styles.statIconMessage}`} />
        <span className={styles.statValue}>{comments}</span>
      </div>
    </div>
  )
}
