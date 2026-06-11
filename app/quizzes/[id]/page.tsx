import { QuizDetailClient } from "./QuizDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `Квіз | Квізы`,
  };
}

export default async function QuizDetailPage({ params }: Props) {
  const { id } = await params;
  return <QuizDetailClient id={id} />;
}
