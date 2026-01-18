import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { CommentDto, TicketDto } from "@devassist/shared";
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

export default function TicketDetailPage() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [comment, setComment] = useState("");

  const query = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => fetchTicket(id as string, accessToken),
    enabled: !!id
  });

  const handleAdd = async () => {
    if (!id || !comment) return;
    await addComment(id, accessToken, comment);
    setComment("");
    query.refetch();
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
        Status: {query.data.ticket.status} · Severity: {query.data.ticket.severity} · Component:
        {query.data.ticket.component}
      </p>

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
