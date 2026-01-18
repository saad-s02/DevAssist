import { Role } from "@devassist/shared";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
