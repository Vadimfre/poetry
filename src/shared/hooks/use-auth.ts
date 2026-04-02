import { useUserStore } from "@/src/entities/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api";
import { LoginDto, RegisterDto } from "../types";
import { toastMessageHandler } from "../utils";
import { toast } from "sonner";

export const useAuth = () => {
  const { setUser, logout: logoutStore } = useUserStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: (response) => {
      setUser(response.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast.success("Вход выполнен", {
        description: `Добро пожаловать, ${response.user.name || response.user.email}!`,
      });
    },
    onError: (error) => {
      toastMessageHandler(error);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      toast.success("Успешная регистрация", {
        description: `Подтвердите почту. Сообщение было отправлено на вашу почту.,`,
      });
    },
    onError: (error) => {
      toastMessageHandler(error);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logoutStore();
      queryClient.clear();
    },
    onError: (error) => {
      toastMessageHandler(error);
    },
  });

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};
