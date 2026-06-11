import { NewVerificationForm } from "@/src/features/auth";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Подтверждение почты",
};

export default function NewVerificationPage() {
  return (
    <div>
      <Suspense fallback={null}>
        <NewVerificationForm />
      </Suspense>
    </div>
  );
}