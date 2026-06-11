import { apiClient } from "../api/client";
import { TypeNewPasswordSchema, TypeResetPasswordSchema } from "./schemas";

class PasswordRecoveryService {
  public async reset(body: TypeResetPasswordSchema) {
    const response = await apiClient.post(
      "/auth/password-recovery/reset",
      body,
    );
    return response.data;
  }

  public async new(body: TypeNewPasswordSchema, token: string | null) {
    const response = await apiClient.post(
      `/auth/password-recovery/new/${token}`,
      body,
    );
    return response.data;
  }
}

export const passwordRecoveryService = new PasswordRecoveryService();
