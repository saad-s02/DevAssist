import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { createKbArticle } from "../state/useKbApi";

export default function KbCreatePage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
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
      const article = await createKbArticle(accessToken, { title, body, tags });
      navigate(`/kb/${article.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create article");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1>Create KB Article</h1>
      <div style={{ display: "grid", gap: 12 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} placeholder="Body" />
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
        <button onClick={handleSubmit} disabled={!title || !body}>
          Create
        </button>
      </div>
    </div>
  );
}
