import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../state/auth";
import { fetchPlaybook, deletePlaybook } from "../state/usePlaybooksApi";
import Layout from "../components/Layout";
import { useState } from "react";

export default function PlaybookDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const playbookQuery = useQuery({
    queryKey: ["playbook", id],
    queryFn: () => fetchPlaybook(null, id as string),
    enabled: !!id
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePlaybook(null, id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      navigate("/playbooks");
    }
  });

  const canEdit = user?.role === "ADMIN" || user?.role === "SUPPORT";
  const canDelete = user?.role === "ADMIN";

  if (playbookQuery.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading playbook...</div>
        </div>
      </Layout>
    );
  }

  if (playbookQuery.error) {
    return (
      <Layout>
        <div className="card p-8 text-center">
          <p className="text-red-600">{(playbookQuery.error as Error).message}</p>
          <Link to="/playbooks" className="mt-4 btn-secondary inline-block">
            Back to Playbooks
          </Link>
        </div>
      </Layout>
    );
  }

  if (!playbookQuery.data) {
    return null;
  }

  const pb = playbookQuery.data;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Link to="/playbooks" className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <span className="text-sm text-gray-500">Playbooks</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{pb.name}</h1>
            {pb.description && (
              <p className="mt-2 text-gray-600">{pb.description}</p>
            )}
            {pb.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {pb.tags.map((tag) => (
                  <span key={tag} className="badge-blue">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {canEdit && (
              <Link to={`/playbooks/${id}/edit`} className="btn-secondary">
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Link>
            )}
            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Template */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Prompt Template</h2>
            <button
              onClick={() => navigator.clipboard.writeText(pb.template)}
              className="btn-ghost text-sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy
            </button>
          </div>
          <div className="p-6">
            <pre className="bg-gray-50 rounded-lg p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap overflow-x-auto">
              {pb.template}
            </pre>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Created: {new Date(pb.createdAt).toLocaleDateString()}
          </div>
          <div>
            Updated: {new Date(pb.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setShowDeleteModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-lg font-semibold text-gray-900">Delete Playbook</h2>
              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to delete "{pb.name}"? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="btn-danger"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
