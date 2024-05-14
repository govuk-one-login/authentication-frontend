import {
  ApiResponseResult,
  DefaultApiResponse,
  UserSession,
  UserSessionClient,
} from "../../types";
import { Request } from "express";

export interface AuthCodeResponse extends DefaultApiResponse {
  location: string;
}

export interface AuthCodeServiceInterface {
  getAuthCode: (
    sessionId: string,
    clientSessionId: string,
    sourceIp: string,
    persistentSessionId: string,
    clientSession: UserSessionClient,
    userSession: UserSession,
    req: Request
  ) => Promise<ApiResponseResult<AuthCodeResponse>>;
}
