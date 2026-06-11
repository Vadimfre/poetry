"use client";

import styles from "./CheckButton.module.css";

export interface CheckButtonProps {
  onClick: () => void;
  disabled?: boolean;
  color?: string | null;
  children: React.ReactNode;
}

export function CheckButton({
  onClick,
  disabled = false,
  color,
  children,
}: CheckButtonProps) {
  return (
    <button
      className={styles.button}
      onClick={onClick}
      disabled={disabled}
      style={{ "--btn-color": color } as React.CSSProperties}
    >
      {children}
    </button>
  );
}
