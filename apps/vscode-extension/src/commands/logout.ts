import * as vscode from "vscode";
import { AuthManager } from "../auth";

export async function logoutCommand(): Promise<void> {
  const authManager = AuthManager.getInstance();

  if (!authManager.isLoggedIn()) {
    vscode.window.showInformationMessage("You are not logged in");
    return;
  }

  const choice = await vscode.window.showWarningMessage(
    "Are you sure you want to logout?",
    "Logout",
    "Cancel"
  );

  if (choice === "Logout") {
    await authManager.clearTokens();
    vscode.window.showInformationMessage("Logged out successfully");
  }
}
