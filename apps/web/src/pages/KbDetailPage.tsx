import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useAuth } from "../state/auth";
import { fetchKbArticle } from "../state/useKbApi";

export default function KbDetailPage() {
  const { id } = useParams();
  const { accessToken } = useAuth();

  const kbQuery = useQuery({
    queryKey: ["kb", id],
    queryFn: () => fetchKbArticle(accessToken, id as string),
    enabled: !!id
  });

  if (kbQuery.isLoading) {
    return <p style={{ padding: 24 }}>Loading...</p>;
  }

  if (kbQuery.error) {
    return <p style={{ padding: 24, color: "crimson" }}>{(kbQuery.error as Error).message}</p>;
  }

  if (!kbQuery.data) {
    return null;
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1>{kbQuery.data.title}</h1>
      <div style={{ color: "#666", marginBottom: 12 }}>{kbQuery.data.tags.join(", ")}</div>
      <p>{kbQuery.data.body}</p>
    </div>
  );
}
