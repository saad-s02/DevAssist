import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { CommentDto, TicketDto, AiSuggestResponse, AiSuggestion } from "@devassist/shared";
import { api, apiRequest } from "../state/api";
import { useState } from "react";
import Layout from "../components/Layout";

const fetchTicket = async (id: string) => {
  return apiRequest<{ ticket: TicketDto; comments: CommentDto[] }>(`/tickets/${id}`);
};

const addComment = async (id: string, body: string) => {
  return apiRequest<CommentDto>(`/tickets/${id}/comments`, {
    method: "POST",
    body: JSON.stringify({ body })
  });
};

const fetchSuggestions = async (id: string) => {
  return apiRequest<AiSuggestResponse>(`/tickets/${id}/suggest`, {
    method: "POST"
  });
};

function SuggestionCard({ suggestion }: { suggestion: AiSuggestion }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "kb_article":
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case "playbook":
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "action":
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
    }
  };

  const getTitle = () => {
    if (suggestion.title) return suggestion.title;
    if (suggestion.name) return suggestion.name;
    if (suggestion.label) return suggestion.label;
    return "Suggestion";
  };

  const getLink = () => {
    if (suggestion.type === "kb_article" && suggestion.id) {
      return `/kb/${suggestion.id}`;
    }
    if (suggestion.type === "playbook" && suggestion.id) {
      return `/playbooks/${suggestion.id}`;
    }
    return null;
  };

  const link = getLink();

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
          {getIcon(suggestion.type)}
        </div>
        <div className="flex-1 min-w-0">
          {link ? (
            <Link to={link} className="text-sm font-medium text-gray-900 hover:text-primary-600">
              {getTitle()}
            </Link>
          ) : (
            <span className="text-sm font-medium text-gray-900">{getTitle()}</span>
          )}
          <p className="text-xs text-gray-500 capitalize">{suggestion.type.replace("_", " ")}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          suggestion.relevance > 0.7 
            ? "bg-green-100 text-green-700" 
            : "bg-yellow-100 text-yellow-700"
        }`}>
          {Math.round(suggestion.relevance * 100)}%
        </span>
      </div>
      {suggestion.description && (
        <p className="mt-2 ml-13 text-sm text-gray-600">{suggestion.description}</p>
      )}
    </div>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const query = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => fetchTicket(id as string),
    enabled: !!id
  });

  const suggestionsMutation = useMutation({
    mutationFn: () => fetchSuggestions(id as string)
  });

  const commentMutation = useMutation({
    mutationFn: (body: string) => addComment(id as string, body),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
    }
  });

  const handleAdd = () => {
    if (!comment.trim()) return;
    commentMutation.mutate(comment);
  };

  if (query.isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading ticket...</div>
        </div>
      </Layout>
    );
  }

  if (query.error) {
    return (
      <Layout>
        <div className="card p-8 text-center">
          <p className="text-red-600">{(query.error as Error).message}</p>
          <Link to="/tickets" className="mt-4 btn-secondary inline-block">
            Back to Tickets
          </Link>
        </div>
      </Layout>
    );
  }

  if (!query.data) {
    return null;
  }

  const { ticket, comments } = query.data;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Link to="/tickets" className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <span className="text-sm text-gray-500">#{ticket.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge status={ticket.status} />
            <SeverityBadge severity={ticket.severity} />
          </div>
        </div>

        {/* Ticket Details */}
        <div className="card p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-gray-500">Component:</span>{" "}
              <span className="font-medium text-gray-900">{ticket.component}</span>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>{" "}
              <span className="font-medium text-gray-900">{new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
            {ticket.slaDueAt && (
              <div>
                <span className="text-gray-500">SLA Due:</span>{" "}
                <span className="font-medium text-gray-900">{new Date(ticket.slaDueAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">AI Suggestions</h2>
            </div>
            <button
              onClick={() => suggestionsMutation.mutate()}
              disabled={suggestionsMutation.isPending}
              className="btn-primary"
            >
              {suggestionsMutation.isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Get Suggestions"
              )}
            </button>
          </div>
          <div className="p-6">
            {suggestionsMutation.isError && (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  {(suggestionsMutation.error as Error).message || "AI Assist is not available. Enable FEATURE_AI_ASSIST in the API."}
                </p>
              </div>
            )}

            {!suggestionsMutation.data && !suggestionsMutation.isError && (
              <p className="text-gray-500 text-sm">
                Click "Get Suggestions" to get AI-powered recommendations for resolving this ticket.
              </p>
            )}

            {suggestionsMutation.data && (
              <div className="space-y-3">
                {suggestionsMutation.data.suggestions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No suggestions available for this ticket.</p>
                ) : (
                  <>
                    {suggestionsMutation.data.suggestions.map((suggestion, idx) => (
                      <SuggestionCard key={idx} suggestion={suggestion} />
                    ))}
                    <p className="text-xs text-gray-400 mt-4">
                      Generated at {new Date(suggestionsMutation.data.generatedAt).toLocaleString()} · Model: {suggestionsMutation.data.model}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Comments ({comments.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {comments.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                No comments yet. Be the first to comment.
              </div>
            ) : (
              comments.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-gray-600">U</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.body}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add comment */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="input"
              placeholder="Write a comment..."
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleAdd}
                disabled={!comment.trim() || commentMutation.isPending}
                className="btn-primary"
              >
                {commentMutation.isPending ? "Adding..." : "Add Comment"}
              </button>
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
