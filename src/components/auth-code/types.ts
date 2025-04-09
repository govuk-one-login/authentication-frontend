import type {
  ApiResponseResult,
  DefaultApiResponse,
  UserSession,
  UserSessionClient,
} from "../../types.js";
import type { Request } from "express";

export interface AuthCodeResponse extends DefaultApiResponse {
  location: string;
}

export interface AuthCodeServiceInterface {
  getAuthCode: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    clientSession: UserSessionClient,
    userSession: UserSession,
    req: Request
  ) => Promise<ApiResponseResult<AuthCodeResponse>>;
}
