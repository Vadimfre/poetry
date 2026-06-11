import { useMutation } from "@tanstack/react-query";
import { toastMessageHandler } from "../../utils";
import { toast } from "sonner";
import { TypeResetPasswordSchema } from "../../services/schemas";
import { passwordRecoveryService } from "../../services";

export function useResetPasswordMutation() {
  const {
    mutate: reset,
    isPending: isLoadingReset,
    error,
  } = useMutation({
    mutationKey: ["reset-password"],
    mutationFn: (data: TypeResetPasswordSchema) =>
      passwordRecoveryService.reset(data),
    onSuccess: () => {
      toast.success("Запрос на сброс пароля отправлен", {
        description: "Проверьте вашу почту для дальнейших инструкций.",
      });
    },
    onError: (error: any) => {
      if (error.response?.status === 404) {
        toast.error("Пользователь не найден", {
          description: "Пожалуйста, проверьте правильность введенного email.",
        });
      } else {
        toastMessageHandler(error);
      }
    },
  });

  return { reset, isLoadingReset, error };
}
