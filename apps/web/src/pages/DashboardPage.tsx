import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "../state/api";
import { TicketDto, KbArticleDto, PlaybookDto } from "@devassist/shared";

export default function DashboardPage() {
  const { data: ticketsResponse } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => api.get<{ items: TicketDto[] }>("/tickets").then((r) => r.data),
  });

  const tickets = Array.isArray(ticketsResponse)
    ? ticketsResponse
    : ticketsResponse?.items || [];

  const { data: kbArticles } = useQuery({
    queryKey: ["kb"],
    queryFn: () => api.get<KbArticleDto[]>("/kb").then((r) => r.data),
  });

  const { data: playbooks } = useQuery({
    queryKey: ["playbooks"],
    queryFn: () => api.get<PlaybookDto[]>("/playbooks").then((r) => r.data),
  });

  const ticketStats = {
    total: tickets?.length || 0,
    open: tickets?.filter((t) => t.status === "OPEN").length || 0,
    inProgress: tickets?.filter((t) => t.status === "IN_PROGRESS").length || 0,
    resolved: tickets?.filter((t) => t.status === "RESOLVED").length || 0,
  };

  const stats = [
    { name: "Total Tickets", value: ticketStats.total, href: "/tickets", color: "bg-blue-500" },
    { name: "Open Tickets", value: ticketStats.open, href: "/tickets?status=OPEN", color: "bg-yellow-500" },
    { name: "In Progress", value: ticketStats.inProgress, href: "/tickets?status=IN_PROGRESS", color: "bg-purple-500" },
    { name: "Resolved", value: ticketStats.resolved, href: "/tickets?status=RESOLVED", color: "bg-green-500" },
  ];

  const recentTickets = tickets?.slice(0, 5) || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your support system
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              to={stat.href}
              className="card p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <span className="text-white text-lg font-semibold">{stat.value}</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent tickets */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recent Tickets</h2>
              <Link to="/tickets" className="text-sm text-primary-600 hover:text-primary-700">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {recentTickets.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No tickets yet. <Link to="/tickets" className="text-primary-600">Create one</Link>
                </div>
              ) : (
                recentTickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                      <p className="text-xs text-gray-500 mt-1">#{ticket.id.slice(0, 8)}</p>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <StatusBadge status={ticket.status} />
                      <SeverityBadge severity={ticket.severity} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-6">
            {/* Knowledge Base summary */}
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Knowledge Base</h2>
                <Link to="/kb" className="text-sm text-primary-600 hover:text-primary-700">
                  Browse →
                </Link>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">{kbArticles?.length || 0}</span>
                  <span className="text-sm text-gray-500">Articles</span>
                </div>
                <Link
                  to="/kb/new"
                  className="mt-4 btn-secondary w-full"
                >
                  + New Article
                </Link>
              </div>
            </div>

            {/* Playbooks summary */}
            <div className="card">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Playbooks</h2>
                <Link to="/playbooks" className="text-sm text-primary-600 hover:text-primary-700">
                  Browse →
                </Link>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-900">{playbooks?.length || 0}</span>
                  <span className="text-sm text-gray-500">Templates</span>
                </div>
                <Link
                  to="/playbooks/new"
                  className="mt-4 btn-secondary w-full"
                >
                  + New Playbook
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    OPEN: "badge-yellow",
    IN_PROGRESS: "badge-blue",
    RESOLVED: "badge-green",
    CLOSED: "badge-gray",
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
