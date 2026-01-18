import * as vscode from "vscode";
import { AuthManager } from "../auth";
import { fetchTickets, Ticket } from "../api";

interface TicketQuickPickItem extends vscode.QuickPickItem {
  ticket: Ticket;
}

export async function listTicketsCommand(): Promise<void> {
  const authManager = AuthManager.getInstance();

  if (!authManager.isLoggedIn()) {
    const choice = await vscode.window.showWarningMessage(
      "You need to login first",
      "Login"
    );
    if (choice === "Login") {
      await vscode.commands.executeCommand("devassist.login");
    }
    return;
  }

  try {
    const response = await fetchTickets();

    if (response.items.length === 0) {
      vscode.window.showInformationMessage("No tickets found");
      return;
    }

    const items: TicketQuickPickItem[] = response.items.map((ticket) => ({
      label: `$(issue-opened) ${ticket.title}`,
      description: `${ticket.status} · ${ticket.severity}`,
      detail: ticket.description.substring(0, 100) + (ticket.description.length > 100 ? "..." : ""),
      ticket
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: `Select a ticket (${response.total} total)`,
      matchOnDescription: true,
      matchOnDetail: true
    });

    if (selected) {
      const panel = vscode.window.createWebviewPanel(
        "ticketDetail",
        `Ticket: ${selected.ticket.title}`,
        vscode.ViewColumn.One,
        {}
      );

      panel.webview.html = getTicketDetailHtml(selected.ticket);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch tickets";
    vscode.window.showErrorMessage(message);
  }
}

function getTicketDetailHtml(ticket: Ticket): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ticket: ${ticket.title}</title>
      <style>
        body {
          font-family: var(--vscode-font-family);
          padding: 20px;
          color: var(--vscode-foreground);
        }
        h1 { margin-bottom: 10px; }
        .meta {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          font-size: 12px;
        }
        .badge {
          padding: 2px 8px;
          border-radius: 4px;
          background: var(--vscode-badge-background);
          color: var(--vscode-badge-foreground);
        }
        .description {
          background: var(--vscode-editor-background);
          padding: 15px;
          border-radius: 4px;
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(ticket.title)}</h1>
      <div class="meta">
        <span class="badge">${ticket.status}</span>
        <span class="badge">${ticket.severity}</span>
        <span class="badge">${ticket.component}</span>
        <span>Created: ${new Date(ticket.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="description">${escapeHtml(ticket.description)}</div>
    </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
