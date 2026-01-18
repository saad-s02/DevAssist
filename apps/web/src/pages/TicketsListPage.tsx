import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { TicketDto } from "@devassist/shared";
import { api } from "../state/api";
import { useState } from "react";
import Layout from "../components/Layout";

export default function TicketsListPage() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<TicketDto["severity"]>("P2");
  const [component, setComponent] = useState<TicketDto["component"]>("CLINE");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: ticketsResponse, isLoading, error } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => api.get<{ items: TicketDto[] }>("/tickets").then((r) => r.data),
  });

  const tickets = Array.isArray(ticketsResponse)
    ? ticketsResponse
    : ticketsResponse?.items || [];

  const createMutation = useMutation({
    mutationFn: (payload: Partial<TicketDto>) => api.post<TicketDto>("/tickets", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
    },
  });

  const handleCreate = () => {
    createMutation.mutate({ title, description, severity, component });
  };

  const filteredTickets = tickets?.filter((t) => 
    statusFilter === "ALL" ? true : t.status === statusFilter
  ) || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track support tickets
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + New Ticket
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <div className="flex space-x-2">
              {["ALL", "OPEN", "IN_PROGRESS", "BLOCKED", "RESOLVED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    statusFilter === status
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "ALL" ? "All" : status.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tickets table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading tickets...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{(error as Error).message}</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tickets found.{" "}
              <button onClick={() => setShowCreateModal(true)} className="text-primary-600 hover:underline">
                Create one
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Component
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/tickets/${ticket.id}`} className="block">
                        <p className="text-sm font-medium text-gray-900 hover:text-primary-600">
                          {ticket.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">#{ticket.id.slice(0, 8)}</p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-4">
                      <SeverityBadge severity={ticket.severity} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{ticket.component}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setShowCreateModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Create New Ticket</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Title</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Brief description of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    placeholder="Detailed description..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Severity</label>
                    <select
                      className="input"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as TicketDto["severity"])}
                    >
                      <option value="P0">P0 - Critical</option>
                      <option value="P1">P1 - High</option>
                      <option value="P2">P2 - Medium</option>
                      <option value="P3">P3 - Low</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="label">Component</label>
                    <select
                      className="input"
                      value={component}
                      onChange={(e) => setComponent(e.target.value as TicketDto["component"])}
                    >
                      <option value="CLINE">Cline</option>
                      <option value="COPILOT">Copilot</option>
                      <option value="RAG">RAG</option>
                      <option value="CI">CI</option>
                      <option value="EXTENSION">Extension</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!title || !description || createMutation.isPending}
                  className="btn-primary"
                >
                  {createMutation.isPending ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    OPEN: "badge-yellow",
    IN_PROGRESS: "badge-blue",
    BLOCKED: "badge-red",
    RESOLVED: "badge-green",
  };
  return <span className={colors[status] || "badge-gray"}>{status.replace("_", " ")}</span>;
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    P0: "badge-red",
    P1: "badge-yellow",
    P2: "badge-blue",
    P3: "badge-gray",
  };
  return <span className={colors[severity] || "badge-gray"}>{severity}</span>;
}
