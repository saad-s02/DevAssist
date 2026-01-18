import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { CommentDto, TicketDto, AiSuggestResponse, AiSuggestion } from "@devassist/shared";
import { apiRequest } from "../state/api";
import { useAuth } from "../state/auth";
import { useState } from "react";

const fetchTicket = async (id: string, token: string | null) => {
  return apiRequest<{ ticket: TicketDto; comments: CommentDto[] }>(`/tickets/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
};

const addComment = async (id: string, token: string | null, body: string) => {
  return apiRequest<CommentDto>(`/tickets/${id}/comments`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify({ body })
  });
};

const fetchSuggestions = async (id: string, token: string | null) => {
  return apiRequest<AiSuggestResponse>(`/tickets/${id}/suggest`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
};

function SuggestionCard({ suggestion }: { suggestion: AiSuggestion }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "kb_article":
        return "📄";
      case "playbook":
        return "📋";
      case "action":
        return "⚡";
      default:
        return "💡";
    }
  };

  const getTitle = () => {
    if (suggestion.title) return suggestion.title;
    if (suggestion.name) return suggestion.name;
    if (suggestion.label) return suggestion.label;
    return "Suggestion";
  };

  const getLink = () => {
    if (suggestion.type === "kb_article" && suggestion.id) {
      return `/kb/${suggestion.id}`;
    }
    if (suggestion.type === "playbook" && suggestion.id) {
      return `/playbooks/${suggestion.id}`;
    }
    return null;
  };

  const link = getLink();

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        backgroundColor: "#fafafa"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>{getIcon(suggestion.type)}</span>
        <div style={{ flex: 1 }}>
          {link ? (
            <Link to={link} style={{ fontWeight: 600, color: "#0066cc" }}>
              {getTitle()}
            </Link>
          ) : (
            <span style={{ fontWeight: 600 }}>{getTitle()}</span>
          )}
          <div style={{ fontSize: 12, color: "#666", textTransform: "capitalize" }}>
            {suggestion.type.replace("_", " ")}
          </div>
        </div>
        <span
          style={{
            fontSize: 12,
            padding: "2px 8px",
            borderRadius: 12,
            backgroundColor: suggestion.relevance > 0.7 ? "#c8e6c9" : "#fff9c4",
            color: suggestion.relevance > 0.7 ? "#2e7d32" : "#f9a825"
          }}
        >
          {Math.round(suggestion.relevance * 100)}%
        </span>
      </div>
      {suggestion.description && (
        <p style={{ margin: "8px 0 0 28px", fontSize: 14, color: "#444" }}>
          {suggestion.description}
        </p>
      )}
    </div>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [comment, setComment] = useState("");

  const query = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => fetchTicket(id as string, accessToken),
    enabled: !!id
  });

  const suggestionsMutation = useMutation({
    mutationFn: () => fetchSuggestions(id as string, accessToken)
  });

  const handleAdd = async () => {
    if (!id || !comment) return;
    await addComment(id, accessToken, comment);
    setComment("");
    query.refetch();
  };

  const handleGetSuggestions = () => {
    suggestionsMutation.mutate();
  };

  if (query.isLoading) {
    return <p style={{ padding: 24 }}>Loading...</p>;
  }

  if (query.error) {
    return <p style={{ padding: 24, color: "crimson" }}>{(query.error as Error).message}</p>;
  }

  if (!query.data) {
    return null;
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1>{query.data.ticket.title}</h1>
      <p>{query.data.ticket.description}</p>
      <p>
        Status: {query.data.ticket.status} · Severity: {query.data.ticket.severity} · Component:{" "}
        {query.data.ticket.component}
      </p>

      {/* AI Suggestions Section */}
      <section
        style={{
          marginTop: 24,
          padding: 16,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          backgroundColor: "#f5f5f5"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>🤖 AI Suggestions</h2>
          <button
            onClick={handleGetSuggestions}
            disabled={suggestionsMutation.isPending}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: suggestionsMutation.isPending ? "wait" : "pointer"
            }}
          >
            {suggestionsMutation.isPending ? "Loading..." : "Get Suggestions"}
          </button>
        </div>

        {suggestionsMutation.isError && (
          <p style={{ color: "crimson", marginTop: 12 }}>
            {(suggestionsMutation.error as Error).message || "AI Assist is not available"}
          </p>
        )}

        {suggestionsMutation.data && (
          <div style={{ marginTop: 16 }}>
            {suggestionsMutation.data.suggestions.length === 0 ? (
              <p style={{ color: "#666" }}>No suggestions available for this ticket.</p>
            ) : (
              <>
                {suggestionsMutation.data.suggestions.map((suggestion, idx) => (
                  <SuggestionCard key={idx} suggestion={suggestion} />
                ))}
                <p style={{ fontSize: 11, color: "#999", marginTop: 8 }}>
                  Generated at {new Date(suggestionsMutation.data.generatedAt).toLocaleString()} ·
                  Model: {suggestionsMutation.data.model}
                </p>
              </>
            )}
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Comments</h2>
        <ul>
          {query.data.comments.map((item) => (
            <li key={item.id} style={{ marginBottom: 12 }}>
              <div>{item.body}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{item.createdAt}</div>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 12 }}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: 8 }}
          />
          <button onClick={handleAdd} disabled={!comment} style={{ marginTop: 8 }}>
            Add comment
          </button>
        </div>
      </section>
    </div>
  );
}
