import { ResetPasswordForm } from "@/src/features/auth";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Сброс пароля",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
