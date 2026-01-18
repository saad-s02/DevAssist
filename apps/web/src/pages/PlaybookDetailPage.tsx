import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../state/auth";
import { fetchPlaybook, deletePlaybook } from "../state/usePlaybooksApi";

export default function PlaybookDetailPage() {
  const { id } = useParams();
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const playbookQuery = useQuery({
    queryKey: ["playbook", id],
    queryFn: () => fetchPlaybook(accessToken, id as string),
    enabled: !!id
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePlaybook(accessToken, id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      navigate("/playbooks");
    }
  });

  const canEdit = user?.role === "ADMIN" || user?.role === "SUPPORT";
  const canDelete = user?.role === "ADMIN";

  if (playbookQuery.isLoading) {
    return <p style={{ padding: 24 }}>Loading...</p>;
  }

  if (playbookQuery.error) {
    return <p style={{ padding: 24, color: "crimson" }}>{(playbookQuery.error as Error).message}</p>;
  }

  if (!playbookQuery.data) {
    return null;
  }

  const pb = playbookQuery.data;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>{pb.name}</h1>
          {pb.description && <p style={{ color: "#666" }}>{pb.description}</p>}
          <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{pb.tags.join(", ")}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {canEdit && <Link to={`/playbooks/${id}/edit`}>Edit</Link>}
          {canDelete && (
            <button
              onClick={() => {
                if (confirm("Delete this playbook?")) {
                  deleteMutation.mutate();
                }
              }}
              style={{ color: "crimson" }}
            >
              Delete
            </button>
          )}
        </div>
      </header>

      <section style={{ marginTop: 24 }}>
        <h3>Template</h3>
        <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 4, whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
          {pb.template}
        </pre>
      </section>

      <footer style={{ marginTop: 24 }}>
        <Link to="/playbooks">← Back to Playbooks</Link>
      </footer>
    </div>
  );
}
