import type {
  ApiResponseResult,
  DefaultApiResponse,
  UserSession,
  UserSessionClient,
} from "../../types.js";
import type { Request, Response } from "express";

export interface AuthCodeResponse extends DefaultApiResponse {
  location: string;
}

export interface AuthCodeServiceInterface {
  getAuthCode: (
    clientSession: UserSessionClient,
    userSession: UserSession,
    req: Request,
    res: Response
  ) => Promise<ApiResponseResult<AuthCodeResponse>>;
}
