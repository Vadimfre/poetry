export type ProseKind = "NOVEL" | "POEM" | "STORY" | "PLAY";

export interface ProseWorkListItem {
  id: number;
  title: string;
  slug: string;
  kind: ProseKind;
  year?: number | null;
  description?: string | null;
  chapterCount: number;
  author?: { id: number; name: string; slug: string };
}

export interface ProseChapterMeta {
  id: number;
  title: string;
  slug: string;
  order: number;
}

export interface ProseWorkDetail {
  id: number;
  title: string;
  slug: string;
  kind: ProseKind;
  year?: number | null;
  description?: string | null;
  author: { id: number; name: string; slug: string; bio?: string | null };
  chapters: ProseChapterMeta[];
  quizzes?: Array<{ id: string; title: string; description?: string | null }>;
}

export interface ProseChapterPage {
  work: {
    id: number;
    title: string;
    slug: string;
    kind: ProseKind;
    author: { id: number; name: string; slug: string };
  };
  chapter: {
    id: number;
    title: string;
    slug: string;
    order: number;
    content: string;
  };
  navigation: {
    prev: ProseChapterMeta | null;
    next: ProseChapterMeta | null;
    total: number;
    current: number;
  };
  toc: ProseChapterMeta[];
}

export interface ReadingAssignment {
  id: string;
  title: string;
  dueDate?: string | null;
  status: string;
  classroomId: string;
  proseWorkId: number;
  proseWork: ProseWorkListItem & {
    author?: { id: number; name: string; slug: string };
  };
  classroom?: { id: string; name: string; code: string };
  myProgress?: {
    id: string;
    progressPercent: number;
    completedAt?: string | null;
    lastChapterId?: number | null;
  } | null;
  progress?: Array<{
    id: string;
    studentId: number;
    progressPercent: number;
    completedAt?: string | null;
  }>;
}

export interface CreateReadingAssignmentDto {
  proseWorkId: number;
  title?: string;
  dueDate?: string;
}

export interface UpdateReadingProgressDto {
  lastChapterId?: number;
  progressPercent?: number;
  completed?: boolean;
}
