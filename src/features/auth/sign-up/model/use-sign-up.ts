"use client";

import { useAuth } from "@/src/shared";

interface UseSignUpProps {
  onSuccess?: () => void;
}

export const useSignUp = ({ onSuccess }: UseSignUpProps = {}) => {
  const { register, isRegistering } = useAuth();

  const mutate = async (data: Parameters<typeof register>[0]) => {
    return register(data)
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
    mutateAsync: register,
    isPending: isRegistering,
    error: null,
    isSuccess: false,
  };
};
