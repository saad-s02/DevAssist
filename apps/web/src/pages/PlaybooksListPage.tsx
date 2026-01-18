import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState } from "react";
import { fetchPlaybooks } from "../state/usePlaybooksApi";
import Layout from "../components/Layout";

export default function PlaybooksListPage() {
  const [search, setSearch] = useState("");

  const playbooksQuery = useQuery({
    queryKey: ["playbooks", search],
    queryFn: () => fetchPlaybooks(null, search)
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    playbooksQuery.refetch();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Playbooks</h1>
            <p className="mt-1 text-sm text-gray-500">
              Cline prompt templates for AI workflows
            </p>
          </div>
          <Link to="/playbooks/new" className="btn-primary">
            + New Playbook
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="card p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search playbooks by name or tag..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

        {/* Playbooks grid */}
        {playbooksQuery.isLoading ? (
          <div className="card p-8 text-center text-gray-500">Loading playbooks...</div>
        ) : playbooksQuery.error ? (
          <div className="card p-8 text-center text-red-600">{(playbooksQuery.error as Error).message}</div>
        ) : !playbooksQuery.data?.length ? (
          <div className="card p-8 text-center text-gray-500">
            No playbooks found.{" "}
            <Link to="/playbooks/new" className="text-primary-600 hover:underline">
              Create one
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {playbooksQuery.data.map((playbook) => (
              <Link
                key={playbook.id}
                to={`/playbooks/${playbook.id}`}
                className="card p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {playbook.name}
                      </h3>
                    </div>
                    {playbook.description && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        {playbook.description}
                      </p>
                    )}
                    {playbook.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {playbook.tags.slice(0, 3).map((t) => (
                          <span key={t} className="badge-blue text-xs">
                            {t}
                          </span>
                        ))}
                        {playbook.tags.length > 3 && (
                          <span className="badge-gray text-xs">
                            +{playbook.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
