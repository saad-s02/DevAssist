import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../state/auth";
import { fetchPlaybooks } from "../state/usePlaybooksApi";

export default function PlaybooksListPage() {
  const { accessToken } = useAuth();
  const [search, setSearch] = useState("");

  const playbooksQuery = useQuery({
    queryKey: ["playbooks", search],
    queryFn: () => fetchPlaybooks(accessToken, search)
  });

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Playbooks</h1>
          <p>Cline prompt templates</p>
        </div>
        <Link to="/playbooks/new">Create playbook</Link>
      </header>

      <section style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <input
          placeholder="Search by name or tag"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={() => playbooksQuery.refetch()}>Search</button>
      </section>

      <section style={{ marginTop: 24 }}>
        {playbooksQuery.isLoading && <p>Loading...</p>}
        {playbooksQuery.error && <p style={{ color: "crimson" }}>{(playbooksQuery.error as Error).message}</p>}
        <ul>
          {playbooksQuery.data?.map((playbook) => (
            <li key={playbook.id} style={{ marginBottom: 12 }}>
              <Link to={`/playbooks/${playbook.id}`}>{playbook.name}</Link>
              {playbook.description && <span style={{ marginLeft: 8, color: "#666" }}>- {playbook.description}</span>}
              <div style={{ fontSize: 12, color: "#888" }}>{playbook.tags.join(", ")}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
