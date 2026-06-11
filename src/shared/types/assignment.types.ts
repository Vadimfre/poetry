import type { QuizPublic, AnswerDto } from "./quiz.types";

export interface ClassroomUser {
  id: number;
  name: string | null;
  email: string;
}

export interface ClassroomMember {
  id: string;
  classroomId: string;
  studentId: number;
  createdAt: string;
  student: ClassroomUser;
}

export interface QuizAttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  itemId: string;
  zoneId: string | null;
  order: number | null;
  content: string | null;
  isCorrect: boolean | null;
}

export interface QuizAttempt {
  id: string;
  assignmentId: string;
  studentId: number;
  total: number;
  correct: number;
  percentage: number;
  grade: number;
  status: "SUBMITTED";
  submittedAt: string;
  student?: ClassroomUser;
  answers?: QuizAttemptAnswer[];
}

export interface AssignedQuizSummary {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  imageUrl: string;
}

export interface QuizAssignmentItem {
  id: string;
  assignmentId: string;
  quizId: string;
  order: number;
  quiz: AssignedQuizSummary;
}

export interface QuizAssignment {
  id: string;
  classroomId: string;
  title: string;
  dueDate: string | null;
  status: "ACTIVE" | "ARCHIVED";
  sendEmailResults: boolean;
  createdAt: string;
  updatedAt: string;
  classroom?: Classroom;
  items: QuizAssignmentItem[];
  attempts: QuizAttempt[];
  quizzes?: QuizPublic[];
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  teacherId: number;
  createdAt: string;
  updatedAt: string;
  teacher: ClassroomUser;
  members: ClassroomMember[];
  assignments: QuizAssignment[];
}

export interface CreateClassroomDto {
  name: string;
}

export interface JoinClassroomDto {
  code: string;
}

export interface CreateAssignmentDto {
  title?: string;
  quizIds: string[];
  dueDate?: string;
  sendEmailResults?: boolean;
}

export interface SubmitAssignmentDto {
  answers: AnswerDto[];
}
