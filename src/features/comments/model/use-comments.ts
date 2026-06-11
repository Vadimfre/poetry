'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/src/shared/api/comments.api';
import type { Comment, CreateCommentDto, UpdateCommentDto } from '@/src/shared/types';

// Получить комментарии к стиху
export const useComments = (poemId: number) => {
  return useQuery<Comment[]>({
    queryKey: ['comments', poemId],
    queryFn: () => commentsApi.getByPoem(poemId),
    enabled: !!poemId,
  });
};

// Создать комментарий
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ poemId, ...data }: { poemId: number } & CreateCommentDto) =>
      commentsApi.create(poemId, data),
    onSuccess: (_, { poemId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', poemId] });
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
    },
  });
};

// Обновить комментарий
export const useUpdateComment = (poemId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCommentDto }) =>
      commentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', poemId] });
    },
  });
};

// Удалить комментарий
export const useDeleteComment = (poemId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => commentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', poemId] });
      queryClient.invalidateQueries({ queryKey: ['poem', poemId] });
    },
  });
};
