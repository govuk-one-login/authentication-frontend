import { Request, Response } from "express";

const ACCOUNT_CREATED_TEMPLATE_NAME = "register-account-created.html";

export function registerAccountCreatedGet(req: Request, res: Response): void {
  res.render(ACCOUNT_CREATED_TEMPLATE_NAME);
}

export function registerAccountCreatedPost(req: Request, res: Response): void {
  // TODO: redirect back to the service
}