export type Role = "ADMIN" | "SUPPORT" | "ENGINEER";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "BLOCKED" | "RESOLVED";

export type TicketSeverity = "P0" | "P1" | "P2" | "P3";

export type TicketComponent =
  | "CLINE"
  | "COPILOT"
  | "RAG"
  | "CI"
  | "EXTENSION"
  | "OTHER";

export interface UserDto {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface TicketDto {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  severity: TicketSeverity;
  component: TicketComponent;
  assigneeId?: string | null;
  requesterId: string;
  slaDueAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommentDto {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface KbArticleDto {
  id: string;
  title: string;
  body: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}
