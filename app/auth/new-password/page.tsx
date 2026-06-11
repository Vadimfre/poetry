import { NewPasswordForm } from "@/src/features/auth";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Новый пароль",
  description: "Установите новый пароль для вашего аккаунта на Poetry.",
};

export default function ResetPasswordPage() {
  return (
    <div className="new-password-page">
      <Suspense fallback={null}>
        <NewPasswordForm />
      </Suspense>
    </div>
  );
}
