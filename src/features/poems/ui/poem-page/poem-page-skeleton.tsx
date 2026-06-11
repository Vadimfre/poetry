"use client";

import { motion } from "framer-motion";
import styles from "./poem-page-skeleton.module.css";

export function PoemPageSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header skeleton */}
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            className="w-10 h-10 rounded-full bg-white/10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="flex-1">
            <motion.div
              className="h-4 w-32 rounded-full bg-white/10 mb-2"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
            />
            <motion.div
              className="h-3 w-20 rounded-full bg-white/5"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Title skeleton */}
        <motion.div
          className="h-8 w-3/4 rounded-lg bg-white/10 mb-6"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />

        {/* Categories skeleton */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-7 w-20 rounded-full bg-white/5"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.4 + i * 0.1,
              }}
            />
          ))}
        </div>

        {/* Poem text skeleton */}
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          <div className="pl-6 border-l-2 border-white/10 space-y-4">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                className="h-4 rounded-full bg-white/5"
                style={{ width: `${70 + Math.random() * 25}%` }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: 0.5 + i * 0.08,
                }}
              />
            ))}
          </div>
        </div>

        {/* Interaction bar skeleton */}
        <div className="flex gap-3 mt-8">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-10 w-24 rounded-full bg-white/5"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 1 + i * 0.1,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
