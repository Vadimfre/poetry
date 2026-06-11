import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { verificationService } from "../../services";
import { toast } from "sonner";
import { useUserStore } from "@/src/entities/user";

export function useVerificationMutation() {
  const router = useRouter();
  const { setUser } = useUserStore();
  const queryClient = useQueryClient();

  const { mutateAsync: verification } = useMutation({
    mutationKey: ["new verification"],
    mutationFn: (token: string | null) => {
      console.log("Mutation called with token:", token);
      return verificationService.newVerification(token);
    },
    onSuccess: (response) => {
      console.log("Verification succeeded, response:", response);
      toast.success("Почта успешно подтверждена");
      setUser(response.user);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: (error: any) => {
      console.error("Verification error:", error);
      toast.error(
        error.response?.data?.message || "Ошибка подтверждения почты",
      );
    },
  });

  return { verification };
}
