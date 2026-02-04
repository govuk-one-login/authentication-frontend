import type { Request, Response } from "express";
import { BadRequestError } from "../../utils/error.js";

export function amcCallbackGet(
  req: Request,
  res: Response
): Response<any, Record<any, any>> {
  const { code, state } = req.query;

  if (code === undefined) {
    throw new BadRequestError("Request query missing auth code param", 400);
  } else if (typeof code !== "string") {
    throw new BadRequestError("Invalid auth code param type", 400);
  }

  if (state === undefined) {
    throw new BadRequestError("Request query missing state param", 400);
  } else if (typeof state !== "string") {
    throw new BadRequestError("Invalid state param type", 400);
  }

  return res.status(200).send("OK");
}
