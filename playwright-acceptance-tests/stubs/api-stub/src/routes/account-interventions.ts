import type { Request, Response } from "express";
import { state } from "../state";

export function accountInterventionsHandler(
  _req: Request,
  res: Response
): void {
  const stubbed = state.stubbedApiResponses.accountInterventionsResponse;
  if (stubbed) {
    res.status(stubbed.status).json(stubbed.body);
    return;
  }

  res.status(200).json(state.accountInterventions);
}
