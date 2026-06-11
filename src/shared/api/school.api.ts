import { apiClient } from "./client";
import type {
  SchoolGradeCurriculum,
  SchoolGradesResponse,
} from "../types/school.types";

export const schoolApi = {
  getGrades: async (): Promise<SchoolGradesResponse> => {
    const response = await apiClient.get<SchoolGradesResponse>("/school/grades");
    return response.data;
  },

  getGrade: async (grade: number): Promise<SchoolGradeCurriculum> => {
    const response = await apiClient.get<SchoolGradeCurriculum>(
      `/school/${grade}`,
    );
    return response.data;
  },
};
