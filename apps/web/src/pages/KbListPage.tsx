import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { fetchKbArticles } from "../state/useKbApi";
import Layout from "../components/Layout";

export default function KbListPage() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");

  const kbQuery = useQuery({
    queryKey: ["kb", query, tag],
    queryFn: () => fetchKbArticles(null, query, tag)
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    kbQuery.refetch();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="mt-1 text-sm text-gray-500">
              Search and browse documentation articles
            </p>
          </div>
          <Link to="/kb/new" className="btn-primary">
            + New Article
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="card p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search articles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input"
              />
            </div>
            <div className="w-48">
              <input
                type="text"
                placeholder="Filter by tag..."
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="input"
              />
            </div>
            <button type="submit" className="btn-secondary">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </form>

        {/* Articles list */}
        <div className="card">
          {kbQuery.isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading articles...</div>
          ) : kbQuery.error ? (
            <div className="p-8 text-center text-red-600">{(kbQuery.error as Error).message}</div>
          ) : !kbQuery.data?.length ? (
            <div className="p-8 text-center text-gray-500">
              No articles found.{" "}
              <Link to="/kb/new" className="text-primary-600 hover:underline">
                Create one
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {kbQuery.data.map((article) => (
                <Link
                  key={article.id}
                  to={`/kb/${article.id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600">
                        {article.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {article.body.substring(0, 150)}...
                      </p>
                      {article.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {article.tags.map((t) => (
                            <span key={t} className="badge-blue">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
