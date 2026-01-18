import * as vscode from "vscode";
import { AuthManager } from "../auth";
import { createTicket } from "../api";

const SEVERITIES = ["P0", "P1", "P2", "P3"];
const COMPONENTS = ["CLINE", "COPILOT", "RAG", "CI", "EXTENSION", "OTHER"];

export async function createTicketCommand(): Promise<void> {
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

  // Step 1: Title
  const title = await vscode.window.showInputBox({
    prompt: "Enter ticket title",
    placeHolder: "Brief description of the issue",
    validateInput: (value: string) => {
      if (!value || value.trim().length < 3) {
        return "Title must be at least 3 characters";
      }
      return null;
    }
  });

  if (!title) {
    return;
  }

  // Step 2: Description
  const description = await vscode.window.showInputBox({
    prompt: "Enter ticket description",
    placeHolder: "Detailed description of the issue",
    validateInput: (value: string) => {
      if (!value || value.trim().length < 10) {
        return "Description must be at least 10 characters";
      }
      return null;
    }
  });

  if (!description) {
    return;
  }

  // Step 3: Severity
  const severity = await vscode.window.showQuickPick(SEVERITIES, {
    placeHolder: "Select severity",
    canPickMany: false
  });

  if (!severity) {
    return;
  }

  // Step 4: Component
  const component = await vscode.window.showQuickPick(COMPONENTS, {
    placeHolder: "Select component",
    canPickMany: false
  });

  if (!component) {
    return;
  }

  try {
    const ticket = await createTicket({
      title: title.trim(),
      description: description.trim(),
      severity,
      component
    });

    const choice = await vscode.window.showInformationMessage(
      `Ticket created: ${ticket.title}`,
      "View Tickets"
    );

    if (choice === "View Tickets") {
      await vscode.commands.executeCommand("devassist.listTickets");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create ticket";
    vscode.window.showErrorMessage(message);
  }
}
