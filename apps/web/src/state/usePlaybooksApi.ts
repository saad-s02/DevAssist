import { PlaybookDto } from "@devassist/shared";
import { apiRequest } from "./api";

export const fetchPlaybooks = (token: string | null, search?: string) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const qs = params.toString();
  return apiRequest<PlaybookDto[]>(`/playbooks${qs ? `?${qs}` : ""}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
};

export const fetchPlaybook = (token: string | null, id: string) => {
  return apiRequest<PlaybookDto>(`/playbooks/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
};

export const createPlaybook = (
  token: string | null,
  payload: Omit<PlaybookDto, "id" | "createdAt" | "updatedAt">
) => {
  return apiRequest<PlaybookDto>("/playbooks", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload)
  });
};

export const updatePlaybook = (
  token: string | null,
  id: string,
  payload: Partial<Pick<PlaybookDto, "name" | "description" | "template" | "tags">>
) => {
  return apiRequest<PlaybookDto>(`/playbooks/${id}`, {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload)
  });
};

export const deletePlaybook = (token: string | null, id: string) => {
  return apiRequest<{ id: string }>(`/playbooks/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
};
