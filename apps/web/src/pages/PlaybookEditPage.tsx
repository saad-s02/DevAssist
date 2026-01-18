import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../state/auth";
import { fetchPlaybook, updatePlaybook } from "../state/usePlaybooksApi";

export default function PlaybookEditPage() {
  const { id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const playbookQuery = useQuery({
    queryKey: ["playbook", id],
    queryFn: () => fetchPlaybook(accessToken, id as string),
    enabled: !!id
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playbookQuery.data) {
      setName(playbookQuery.data.name);
      setDescription(playbookQuery.data.description || "");
      setTemplate(playbookQuery.data.template);
      setTags(playbookQuery.data.tags);
    }
  }, [playbookQuery.data]);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    setTags((prev) => Array.from(new Set([...prev, trimmed])));
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      await updatePlaybook(accessToken, id as string, { name, description, template, tags });
      queryClient.invalidateQueries({ queryKey: ["playbook", id] });
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      navigate(`/playbooks/${id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update playbook");
    }
  };

  if (playbookQuery.isLoading) {
    return <p style={{ padding: 24 }}>Loading...</p>;
  }

  if (playbookQuery.error) {
    return <p style={{ padding: 24, color: "crimson" }}>{(playbookQuery.error as Error).message}</p>;
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1>Edit Playbook</h1>
      <div style={{ display: "grid", gap: 12 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" />
        <textarea value={template} onChange={(e) => setTemplate(e.target.value)} rows={12} placeholder="Prompt template" />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag"
          />
          <button type="button" onClick={addTag}>
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {tags.map((tag) => (
              <span key={tag} style={{ background: "#eee", padding: "4px 8px", borderRadius: 4 }}>
                {tag}
                <button type="button" onClick={() => removeTag(tag)} style={{ marginLeft: 4 }}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleSubmit} disabled={!name || !template}>
            Save
          </button>
          <Link to={`/playbooks/${id}`}>Cancel</Link>
        </div>
      </div>
    </div>
  );
}
