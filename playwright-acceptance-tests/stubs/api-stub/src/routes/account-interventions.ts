import type { Request, Response } from "express";
import { state } from "../state";

export function accountInterventionsHandler(req: Request, res: Response): void {
  res.status(200).json(state.accountInterventions);
}
