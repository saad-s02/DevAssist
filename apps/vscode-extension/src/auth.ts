import * as vscode from "vscode";

const ACCESS_TOKEN_KEY = "devassist.accessToken";
const REFRESH_TOKEN_KEY = "devassist.refreshToken";

export class AuthManager {
  private static instance: AuthManager;
  private secretStorage: vscode.SecretStorage;
  private accessToken: string | undefined;
  private refreshToken: string | undefined;

  private constructor(context: vscode.ExtensionContext) {
    this.secretStorage = context.secrets;
  }

  static initialize(context: vscode.ExtensionContext): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager(context);
    }
    return AuthManager.instance;
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      throw new Error("AuthManager not initialized. Call initialize() first.");
    }
    return AuthManager.instance;
  }

  async loadTokens(): Promise<void> {
    this.accessToken = await this.secretStorage.get(ACCESS_TOKEN_KEY);
    this.refreshToken = await this.secretStorage.get(REFRESH_TOKEN_KEY);
  }

  async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    await this.secretStorage.store(ACCESS_TOKEN_KEY, accessToken);
    await this.secretStorage.store(REFRESH_TOKEN_KEY, refreshToken);
  }

  async clearTokens(): Promise<void> {
    this.accessToken = undefined;
    this.refreshToken = undefined;
    await this.secretStorage.delete(ACCESS_TOKEN_KEY);
    await this.secretStorage.delete(REFRESH_TOKEN_KEY);
  }

  getAccessToken(): string | undefined {
    return this.accessToken;
  }

  getRefreshToken(): string | undefined {
    return this.refreshToken;
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }
}
