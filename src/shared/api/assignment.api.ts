import type {
  CreateAssignmentDto,
  QuizAssignment,
  QuizAttempt,
  SubmitAssignmentDto,
} from "../types/assignment.types";
import { apiClient } from "./client";

export const assignmentApi = {
  create: async (
    classroomId: string,
    dto: CreateAssignmentDto,
  ): Promise<QuizAssignment> => {
    const response = await apiClient.post<QuizAssignment>(
      `/classrooms/${classroomId}/assignments`,
      dto,
    );
    return response.data;
  },

  getMy: async (): Promise<QuizAssignment[]> => {
    const response = await apiClient.get<QuizAssignment[]>("/assignments/my");
    return response.data;
  },

  getById: async (id: string): Promise<QuizAssignment> => {
    const response = await apiClient.get<QuizAssignment>(`/assignments/${id}`);
    return response.data;
  },

  getResults: async (id: string): Promise<QuizAssignment> => {
    const response = await apiClient.get<QuizAssignment>(
      `/assignments/${id}/results`,
    );
    return response.data;
  },

  submit: async (
    id: string,
    dto: SubmitAssignmentDto,
  ): Promise<QuizAttempt> => {
    const response = await apiClient.post<QuizAttempt>(
      `/assignments/${id}/submit`,
      dto,
    );
    return response.data;
  },
};
