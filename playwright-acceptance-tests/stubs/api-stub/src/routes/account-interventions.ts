import type { Request, Response } from "express";
import { state } from "../state";

const NO_INTERVENTIONS = {
  blocked: false,
  temporarilySuspended: false,
  reproveIdentity: false,
  passwordResetRequired: false,
};

export function accountInterventionsHandler(
  _req: Request,
  res: Response
): void {
  const stubbed = state.stubbedApiResponses.accountInterventionsResponse;
  if (stubbed) {
    res.status(stubbed.status).json(stubbed.body);
    return;
  }

  res.status(200).json(NO_INTERVENTIONS);
}
