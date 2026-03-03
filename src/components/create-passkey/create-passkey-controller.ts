import type { Request, Response } from "express";

const TEMPLATE_NAME = "create-passkey/index.njk";

export function createPasskeyGet(req: Request, res: Response): void {
  return res.render(TEMPLATE_NAME);
}
