import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createKbArticle } from "../state/useKbApi";
import Layout from "../components/Layout";

export default function KbCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const article = await createKbArticle(null, { title, body, tags });
      navigate(`/kb/${article.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Link to="/kb" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create KB Article</h1>
        </div>

        {/* Form */}
        <div className="card p-6 space-y-6">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
            />
          </div>

          <div>
            <label className="label">Content</label>
            <textarea
              className="input"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder="Write your article content here..."
            />
          </div>

          <div>
            <label className="label">Tags</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                className="input flex-1"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
              />
              <button type="button" onClick={addTag} className="btn-secondary">
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="badge-blue flex items-center space-x-1">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Link to="/kb" className="btn-secondary">
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={!title || !body || loading}
              className="btn-primary"
            >
              {loading ? "Creating..." : "Create Article"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
