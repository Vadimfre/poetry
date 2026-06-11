"use client";

import { SchoolGradePage } from "@/src/features/school";

type Props = {
  params: { grade: string };
};

export default function Page({ params }: Props) {
  const { grade } = params;
  const gradeNum = Number.parseInt(grade, 10);

  if (!Number.isFinite(gradeNum) || gradeNum < 5 || gradeNum > 11) {
    return null;
  }

  return <SchoolGradePage grade={gradeNum} />;
}
