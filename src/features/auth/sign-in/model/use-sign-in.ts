"use client";

import { useAuth } from "@/src/shared";

interface UseSignInProps {
  onSuccess?: () => void;
}

export const useSignIn = ({ onSuccess }: UseSignInProps = {}) => {
  const { login, isLoggingIn } = useAuth();

  const mutate = async (data: Parameters<typeof login>[0]) => {
    return login(data)
      .then(() => {
        if (onSuccess) onSuccess();
      })
      .catch((error) => {
        // Ошибка уже обработана в useAuth.onError
        // Возвращаем resolved promise чтобы не было unhandled rejection
        return Promise.resolve();
      });
  };

  return {
    mutate,
    mutateAsync: login,
    isPending: isLoggingIn,
    error: null,
    isSuccess: false,
  };
};
