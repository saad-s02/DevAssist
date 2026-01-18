import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../state/auth";
import { fetchKbArticles } from "../state/useKbApi";

export default function KbListPage() {
  const { accessToken } = useAuth();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");

  const kbQuery = useQuery({
    queryKey: ["kb", query, tag],
    queryFn: () => fetchKbArticles(accessToken, query, tag)
  });

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Knowledge Base</h1>
          <p>Keyword search + tags</p>
        </div>
        <Link to="/kb/new">Create article</Link>
      </header>

      <section style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <input
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <input
          placeholder="Tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          style={{ width: 160, padding: 8 }}
        />
        <button onClick={() => kbQuery.refetch()}>Search</button>
      </section>

      <section style={{ marginTop: 24 }}>
        {kbQuery.isLoading && <p>Loading...</p>}
        {kbQuery.error && <p style={{ color: "crimson" }}>{(kbQuery.error as Error).message}</p>}
        <ul>
          {kbQuery.data?.map((article) => (
            <li key={article.id} style={{ marginBottom: 12 }}>
              <Link to={`/kb/${article.id}`}>{article.title}</Link>
              <div style={{ fontSize: 12, color: "#666" }}>{article.tags.join(", ")}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
