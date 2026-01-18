import { KbArticleDto } from "@devassist/shared";
import { apiRequest } from "./api";

export const fetchKbArticles = (token: string | null, query?: string, tag?: string) => {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return apiRequest<KbArticleDto[]>(`/kb${qs ? `?${qs}` : ""}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
};

export const fetchKbArticle = (token: string | null, id: string) => {
  return apiRequest<KbArticleDto>(`/kb/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
};

export const createKbArticle = (token: string | null, payload: Omit<KbArticleDto, "id" | "createdAt" | "updatedAt">) => {
  return apiRequest<KbArticleDto>("/kb", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload)
  });
};

export const updateKbArticle = (
  token: string | null,
  id: string,
  payload: Partial<Pick<KbArticleDto, "title" | "body" | "tags">>
) => {
  return apiRequest<KbArticleDto>(`/kb/${id}`, {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload)
  });
};

export const deleteKbArticle = (token: string | null, id: string) => {
  return apiRequest<{ id: string }>(`/kb/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
};
