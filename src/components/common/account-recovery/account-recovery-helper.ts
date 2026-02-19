import type { Request, Response } from "express";
import type { AccountRecoveryInterface } from "./types.js";
import { BadRequestError } from "../../../utils/error.js";

export async function isAccountRecoveryPermitted(
  req: Request,
  res: Response,
  acctRecoveryService: AccountRecoveryInterface
): Promise<boolean> {
  const { email } = req.session.user;

  const accountRecoveryResponse = await acctRecoveryService.accountRecovery(
    email,
    req,
    res
  );

  if (!accountRecoveryResponse.success) {
    throw new BadRequestError(
      accountRecoveryResponse.data.message,
      accountRecoveryResponse.data.code
    );
  }

  return accountRecoveryResponse.data.accountRecoveryPermitted;
}
