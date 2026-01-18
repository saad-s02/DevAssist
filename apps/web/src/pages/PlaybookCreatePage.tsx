import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPlaybook } from "../state/usePlaybooksApi";
import Layout from "../components/Layout";

export default function PlaybookCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("");
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
      const playbook = await createPlaybook(null, { name, description, template, tags });
      navigate(`/playbooks/${playbook.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create playbook");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Link to="/playbooks" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Playbook</h1>
        </div>

        {/* Form */}
        <div className="card p-6 space-y-6">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Playbook name"
            />
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <input
              type="text"
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this playbook does"
            />
          </div>

          <div>
            <label className="label">Prompt Template</label>
            <textarea
              className="input font-mono text-sm"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={16}
              placeholder="Enter your Cline prompt template here...

Use {{variables}} for dynamic content.

Example:
You are helping with a {{component}} issue.
The error message is: {{error}}
Please suggest a solution."
            />
            <p className="mt-2 text-xs text-gray-500">
              Use <code className="bg-gray-100 px-1 rounded">{"{{variable}}"}</code> syntax for dynamic placeholders.
            </p>
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
                  <span key={tag} className="badge-blue flex items-center">
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
            <Link to="/playbooks" className="btn-secondary">
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={!name || !template || loading}
              className="btn-primary"
            >
              {loading ? "Creating..." : "Create Playbook"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
