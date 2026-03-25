"use client"

import { Sparkles } from "lucide-react"
import styles from "./loading-state.module.css"

export function LoadingState() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        <div className={styles.loadingGlow}>
          <div className={styles.loadingPulse} />
          <div className={styles.loadingIconWrapper}>
            <Sparkles className={styles.loadingIcon} />
          </div>
        </div>
        <div className={styles.loadingText}>
          <p className={styles.loadingTitle}>Загрузка свята...</p>
          <p className={styles.loadingSubtitle}>Пачакайце, калі ласка</p>
        </div>
      </div>
    </div>
  )
}
