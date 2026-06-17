import { QuizDetailClient } from "./QuizDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  await params;
  return {
    title: "Quiz",
  };
}

export default async function QuizDetailPage({ params }: Props) {
  const { id } = await params;
  return <QuizDetailClient id={id} />;
}
