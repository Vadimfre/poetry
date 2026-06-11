// ========== Response types ==========

export type QuestionType = "MATCH" | "ORDER" | "FILL";

export interface ItemZonePublic {
  id: string;
  itemId: string;
  zoneId: string;
  order: number | null;
}

export interface QuizItemPublic {
  id: string;
  questionId: string;
  content: string;
  order: number | null;
  year: number | null;
  imageUrl: string | null;
  subtitle: string | null;
  itemZones: ItemZonePublic[];
}

export interface QuizZonePublic {
  id: string;
  questionId: string;
  content: string;
  order: number | null;
  itemZones: ItemZonePublic[];
}

export interface QuizQuestionPublic {
  id: string;
  quizId: string;
  text: string;
  type: QuestionType;
  content: Record<string, any> | null;
  items: QuizItemPublic[];
  zones: QuizZonePublic[];
}

export interface QuizPublic {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  imageUrl: string;
  questions: QuizQuestionPublic[];
}

export interface QuizListItem {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  imageUrl: string;
  questionsCount: number;
}

// ========== Check answers ==========

export interface AnswerDto {
  questionId: string;
  itemId: string;
  zoneId?: string;
  order?: number;
  content?: string;
}

export interface CheckQuizAnswersDto {
  answers: AnswerDto[];
}

export interface CheckQuizAnswersResponse {
  total: number;
  correct: number;
}
