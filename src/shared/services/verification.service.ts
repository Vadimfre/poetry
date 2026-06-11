import { authApi } from "../api";

class VerificationService {
  public async newVerification(token: string | null) {
    if (!token) throw new Error("Token is required");
    const response = await authApi.newVerification(token);
    return response;
  }
}

export const verificationService = new VerificationService();
