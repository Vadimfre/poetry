import type {
  CreateReadingAssignmentDto,
  ProseChapterPage,
  ProseWorkDetail,
  ProseWorkListItem,
  ReadingAssignment,
  UpdateReadingProgressDto,
} from "../types/prose.types";
import { apiClient } from "./client";

export const proseApi = {
  getAll: async (): Promise<ProseWorkListItem[]> => {
    const res = await apiClient.get<ProseWorkListItem[]>("/prose");
    return res.data;
  },

  getByAuthor: async (authorSlug: string): Promise<ProseWorkListItem[]> => {
    const res = await apiClient.get<ProseWorkListItem[]>(
      `/prose/by-author/${authorSlug}`,
    );
    return res.data;
  },

  getBySlug: async (slug: string): Promise<ProseWorkDetail> => {
    const res = await apiClient.get<ProseWorkDetail>(`/prose/${slug}`);
    return res.data;
  },

  getChapter: async (
    slug: string,
    chapterSlug: string,
  ): Promise<ProseChapterPage> => {
    const res = await apiClient.get<ProseChapterPage>(
      `/prose/${slug}/chapters/${chapterSlug}`,
    );
    return res.data;
  },
};

export const readingAssignmentApi = {
  create: async (
    classroomId: string,
    dto: CreateReadingAssignmentDto,
  ): Promise<ReadingAssignment> => {
    const res = await apiClient.post<ReadingAssignment>(
      `/classrooms/${classroomId}/reading-assignments`,
      dto,
    );
    return res.data;
  },

  getForClassroom: async (
    classroomId: string,
  ): Promise<ReadingAssignment[]> => {
    const res = await apiClient.get<ReadingAssignment[]>(
      `/classrooms/${classroomId}/reading-assignments`,
    );
    return res.data;
  },

  getMy: async (): Promise<ReadingAssignment[]> => {
    const res = await apiClient.get<ReadingAssignment[]>(
      "/reading-assignments/my",
    );
    return res.data;
  },

  updateProgress: async (
    assignmentId: string,
    dto: UpdateReadingProgressDto,
  ) => {
    const res = await apiClient.patch(
      `/reading-assignments/${assignmentId}/progress`,
      dto,
    );
    return res.data;
  },
};
