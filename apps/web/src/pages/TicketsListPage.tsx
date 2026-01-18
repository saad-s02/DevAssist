import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PaginatedResult, TicketDto } from "@devassist/shared";
import { apiRequest } from "../state/api";
import { useAuth } from "../state/auth";
import { useState } from "react";

const fetchTickets = async (token: string | null) => {
  return apiRequest<PaginatedResult<TicketDto>>("/tickets", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
};

const createTicket = async (token: string | null, payload: Partial<TicketDto>) => {
  return apiRequest<TicketDto>("/tickets", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: JSON.stringify(payload)
  });
};

export default function TicketsListPage() {
  const { accessToken, user, logout } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<TicketDto["severity"]>("P2");
  const [component, setComponent] = useState<TicketDto["component"]>("CLINE");

  const query = useQuery({
    queryKey: ["tickets"],
    queryFn: () => fetchTickets(accessToken)
  });

  const handleCreate = async () => {
    await createTicket(accessToken, { title, description, severity, component });
    setTitle("");
    setDescription("");
    query.refetch();
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Tickets</h1>
          <p>Welcome, {user?.email}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/kb">
            <button>Knowledge Base</button>
          </Link>
          <button onClick={logout}>Log out</button>
        </div>
      </header>

      <section style={{ marginTop: 24 }}>
        <h2>Create Ticket</h2>
        <div style={{ display: "grid", gap: 12 }}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 8 }}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ padding: 8 }}
          />
          <div style={{ display: "flex", gap: 12 }}>
            <select value={severity} onChange={(e) => setSeverity(e.target.value as TicketDto["severity"])}>
              <option value="P0">P0</option>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
              <option value="P3">P3</option>
            </select>
            <select value={component} onChange={(e) => setComponent(e.target.value as TicketDto["component"])}>
              <option value="CLINE">Cline</option>
              <option value="COPILOT">Copilot</option>
              <option value="RAG">RAG</option>
              <option value="CI">CI</option>
              <option value="EXTENSION">Extension</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <button onClick={handleCreate} disabled={!title || !description}>
            Create
          </button>
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>All Tickets</h2>
        {query.isLoading && <p>Loading...</p>}
        {query.error && <p style={{ color: "crimson" }}>{(query.error as Error).message}</p>}
        <ul>
          {query.data?.items.map((ticket) => (
            <li key={ticket.id} style={{ marginBottom: 12 }}>
              <Link to={`/tickets/${ticket.id}`}>
                {ticket.title} ({ticket.status})
              </Link>
              <div style={{ fontSize: 12, color: "#666" }}>
                {ticket.severity} · {ticket.component}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
