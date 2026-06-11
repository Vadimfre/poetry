import { useMutation } from "@tanstack/react-query";
import { toastMessageHandler } from "../../utils";
import { toast } from "sonner";
import { TypeNewPasswordSchema } from "../../services/schemas";
import { passwordRecoveryService } from "../../services";
import { useRouter, useSearchParams } from "next/navigation";

export function useNewPasswordMutation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const { mutate: newPassword, isPending: isLoadingNew } = useMutation({
    mutationKey: ["new-password"],
    mutationFn: (data: TypeNewPasswordSchema) =>
      passwordRecoveryService.new(data, token),
    onSuccess: () => {
      toast.success("Пароль успешно изменён", {
        description: "Теперь вы можете войти с новым паролем.",
      });
      router.push("/");
    },
    onError: (error) => {
      toastMessageHandler(error);
    },
  });

  return { newPassword, isLoadingNew };
}
