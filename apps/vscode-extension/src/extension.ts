import * as vscode from "vscode";
import { AuthManager } from "./auth";
import { fetchTicketCount } from "./api";
import { loginCommand } from "./commands/login";
import { logoutCommand } from "./commands/logout";
import { listTicketsCommand } from "./commands/listTickets";
import { createTicketCommand } from "./commands/createTicket";

let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log("DevAssist Hub extension is now active");

  // Initialize auth manager
  const authManager = AuthManager.initialize(context);
  await authManager.loadTokens();

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = "devassist.listTickets";
  context.subscriptions.push(statusBarItem);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("devassist.login", async () => {
      await loginCommand();
      await updateStatusBar();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("devassist.logout", async () => {
      await logoutCommand();
      await updateStatusBar();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("devassist.listTickets", listTicketsCommand)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("devassist.createTicket", async () => {
      await createTicketCommand();
      await updateStatusBar();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("devassist.refreshTickets", updateStatusBar)
  );

  // Initial status bar update
  await updateStatusBar();
}

async function updateStatusBar(): Promise<void> {
  const authManager = AuthManager.getInstance();

  if (!authManager.isLoggedIn()) {
    statusBarItem.text = "$(log-in) DevAssist: Login";
    statusBarItem.tooltip = "Click to login to DevAssist Hub";
    statusBarItem.command = "devassist.login";
    statusBarItem.show();
    return;
  }

  try {
    const count = await fetchTicketCount();
    statusBarItem.text = `$(issue-opened) DevAssist: ${count} tickets`;
    statusBarItem.tooltip = "Click to view tickets";
    statusBarItem.command = "devassist.listTickets";
    statusBarItem.show();
  } catch (error) {
    statusBarItem.text = "$(warning) DevAssist: Error";
    statusBarItem.tooltip = "Failed to fetch ticket count";
    statusBarItem.show();
  }
}

export function deactivate(): void {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
