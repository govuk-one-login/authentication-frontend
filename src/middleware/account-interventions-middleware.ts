import { NextFunction, Request, Response } from "express";
import { Http } from "../utils/http";
import { API_ENDPOINTS } from "../app.constants";

export async function accountInterventionsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
  axios: Http
) {
  await Promise.resolve();
  return next();
}