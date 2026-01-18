import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { fetchKbArticle } from "../state/useKbApi";
import Layout from "../components/Layout";

export default function KbDetailPage() {
  const { id } = useParams();

  const kbQuery = useQuery({
    queryKey: ["kb", id],
    queryFn: () => fetchKbArticle(null, id as string),
    enabled: !!id
  });

  if (kbQuery.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading article...</div>
        </div>
      </Layout>
    );
  }

  if (kbQuery.error) {
    return (
      <Layout>
        <div className="card p-8 text-center">
          <p className="text-red-600">{(kbQuery.error as Error).message}</p>
          <Link to="/kb" className="mt-4 btn-secondary inline-block">
            Back to Knowledge Base
          </Link>
        </div>
      </Layout>
    );
  }

  if (!kbQuery.data) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <Link to="/kb" className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <span className="text-sm text-gray-500">Knowledge Base</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{kbQuery.data.title}</h1>
          {kbQuery.data.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {kbQuery.data.tags.map((tag) => (
                <span key={tag} className="badge-blue">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="card p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{kbQuery.data.body}</p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Created: {new Date(kbQuery.data.createdAt).toLocaleDateString()}
          </div>
          <div>
            Updated: {new Date(kbQuery.data.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Layout>
  );
}
