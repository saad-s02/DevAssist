import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../state/auth";
import { createPlaybook } from "../state/usePlaybooksApi";

export default function PlaybookCreatePage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    setTags((prev) => Array.from(new Set([...prev, trimmed])));
    setTagInput("");
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const playbook = await createPlaybook(accessToken, { name, description, template, tags });
      navigate(`/playbooks/${playbook.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create playbook");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1>Create Playbook</h1>
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
        {tags.length > 0 && <div>Tags: {tags.join(", ")}</div>}
        {error && <p style={{ color: "crimson" }}>{error}</p>}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleSubmit} disabled={!name || !template}>
            Create
          </button>
          <Link to="/playbooks">Cancel</Link>
        </div>
      </div>
    </div>
  );
}
