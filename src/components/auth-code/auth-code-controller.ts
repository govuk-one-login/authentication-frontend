import { Request, Response } from "express";
import { getApiBaseUrl } from "../../config";
import { API_ENDPOINTS } from "../../app.constants";

export function authCodeGet(req: Request, res: Response): void {
  const authCodeUrl = getApiBaseUrl() + API_ENDPOINTS.AUTH_CODE;
  res.redirect(authCodeUrl);
}
