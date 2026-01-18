import * as vscode from "vscode";
import { AuthManager } from "./auth";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  component: string;
  createdAt: string;
}

export interface TicketsResponse {
  items: Ticket[];
  total: number;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  severity: string;
  component: string;
}

function getApiBaseUrl(): string {
  const config = vscode.workspace.getConfiguration("devassist");
  return config.get<string>("apiBaseUrl") || "http://localhost:3000";
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const authManager = AuthManager.getInstance();
  const token = authManager.getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = "Login failed";
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<LoginResponse>;
}

export async function fetchTickets(
  page: number = 1,
  limit: number = 50
): Promise<TicketsResponse> {
  return apiRequest<TicketsResponse>(`/tickets?page=${page}&limit=${limit}`);
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  return apiRequest<Ticket>("/tickets", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function fetchTicketCount(): Promise<number> {
  const response = await fetchTickets(1, 1);
  return response.total;
}
