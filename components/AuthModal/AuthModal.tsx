"use client";

import { useState } from "react";
import { SignInForm, SignUpForm } from "@/src/features/auth";
import styles from "./AuthModal.module.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (userData: { name: string; email: string }) => void;
}

const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  const handleRegisterSuccess = () => {
    // Не закрываем модальнае акно
    // Толькі паказваем toast (ужо ў use-sign-up.ts)
    // Можна паказаць дадатковае паведамленне ў форме
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        <div className={styles.iconContainer}>
          <svg className={styles.icon} viewBox="0 0 100 100" fill="none">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              d="M 30 30 Q 50 50 30 70"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
            />
            <path d="M 50 20 L 70 40" stroke="currentColor" strokeWidth="3" />
            <path d="M 70 40 L 80 35" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>

        <div className={styles.content}>
          {isLogin ? (
            <SignInForm
              onSuccess={handleSuccess}
              onSwitchToSignUp={() => setIsLogin(false)}
            />
          ) : (
            <SignUpForm
              onSuccess={handleRegisterSuccess}
              onSwitchToSignIn={() => setIsLogin(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
