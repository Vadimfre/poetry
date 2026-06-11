import type {
  Classroom,
  CreateClassroomDto,
  JoinClassroomDto,
} from "../types/assignment.types";
import { apiClient } from "./client";

export const classroomApi = {
  create: async (dto: CreateClassroomDto): Promise<Classroom> => {
    const response = await apiClient.post<Classroom>("/classrooms", dto);
    return response.data;
  },

  getMy: async (): Promise<Classroom[]> => {
    const response = await apiClient.get<Classroom[]>("/classrooms/my");
    return response.data;
  },

  getById: async (id: string): Promise<Classroom> => {
    const response = await apiClient.get<Classroom>(`/classrooms/${id}`);
    return response.data;
  },

  join: async (dto: JoinClassroomDto): Promise<Classroom> => {
    const response = await apiClient.post<Classroom>("/classrooms/join", dto);
    return response.data;
  },
};
