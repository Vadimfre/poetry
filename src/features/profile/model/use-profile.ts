'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type UpdateProfileDto, type UpdateEmailDto, type UpdatePasswordDto, type UserProfile } from '@/src/shared/api/users.api';
import { useUserStore } from '@/src/entities/user';

// Получить профиль текущего пользователя
export const useProfile = () => {
  const { isAuthenticated } = useUserStore();

  return useQuery<UserProfile>({
    queryKey: ['profile', 'me'],
    queryFn: usersApi.getMe,
    enabled: isAuthenticated,
    retry: false,
  });
};

// Обновить профиль (имя, аватар)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Обновляем кэш профиля
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      // Обновляем глобальное состояние пользователя
      setUser(updatedUser);
    },
  });
};

// Обновить email
export const useUpdateEmail = () => {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (data: UpdateEmailDto) => usersApi.updateEmail(data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setUser(updatedUser);
    },
  });
};

// Обновить пароль
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (data: UpdatePasswordDto) => usersApi.updatePassword(data),
  });
};
