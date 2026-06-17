import { QuizListClient } from "./QuizListClient";

export const metadata = {
  title: "Quizzes",
  description: "Interactive quizzes about Belarusian literature",
};

export default function QuizPage() {
  return <QuizListClient />;
}
