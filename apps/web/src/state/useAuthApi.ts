import { AuthTokensDto } from "@devassist/shared";
import { apiRequest } from "./api";

export const loginRequest = (email: string, password: string) => {
  return apiRequest<AuthTokensDto>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
};
