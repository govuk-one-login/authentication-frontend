import type { Request, Response } from "express";

export async function signInWithPasskeyGet(
  req: Request,
  res: Response
): Promise<void> {
  res.render("sign-in-with-passkey/index.njk");
}
