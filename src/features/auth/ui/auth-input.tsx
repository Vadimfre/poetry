'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import styles from './auth-input.module.css';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ error, label, className, ...props }, ref) => {
    return (
      <div className={styles.inputWrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <input
          ref={ref}
          className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`}
          {...props}
        />
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';
