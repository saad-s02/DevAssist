import * as vscode from "vscode";
import { AuthManager } from "../auth";
import { login } from "../api";

export async function loginCommand(): Promise<void> {
  const authManager = AuthManager.getInstance();

  if (authManager.isLoggedIn()) {
    const choice = await vscode.window.showInformationMessage(
      "You are already logged in. Do you want to log out first?",
      "Logout",
      "Cancel"
    );
    if (choice === "Logout") {
      await authManager.clearTokens();
      vscode.window.showInformationMessage("Logged out successfully");
    }
    return;
  }

  const email = await vscode.window.showInputBox({
    prompt: "Enter your email",
    placeHolder: "user@example.com",
    validateInput: (value: string) => {
      if (!value || !value.includes("@")) {
        return "Please enter a valid email";
      }
      return null;
    }
  });

  if (!email) {
    return;
  }

  const password = await vscode.window.showInputBox({
    prompt: "Enter your password",
    password: true,
    validateInput: (value: string) => {
      if (!value || value.length < 1) {
        return "Password is required";
      }
      return null;
    }
  });

  if (!password) {
    return;
  }

  try {
    const response = await login(email, password);
    await authManager.storeTokens(response.accessToken, response.refreshToken);
    vscode.window.showInformationMessage(
      `Logged in as ${response.user.email} (${response.user.role})`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    vscode.window.showErrorMessage(`Login failed: ${message}`);
  }
}
