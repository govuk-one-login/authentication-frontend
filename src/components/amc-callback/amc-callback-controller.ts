import type { Request, Response } from "express";
import { amcResultService } from "./amc-result-service.js";
import type { AMCResultInterface } from "./types.js";
import type { ExpressRouteFunc } from "../../types.js";

export function amcCallbackGet(
  service: AMCResultInterface = amcResultService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response): Promise<void> {
    const { code, state } = req.query;

    if (code === undefined) {
      res.status(400).json({ error: "Request query missing auth code param" });
      return;
    } else if (typeof code !== "string") {
      res.status(400).json({ error: "Invalid auth code param type" });
      return;
    }

    if (state === undefined) {
      res.status(400).json({ error: "Request query missing state param" });
      return;
    } else if (typeof state !== "string") {
      res.status(400).json({ error: "Invalid state param type" });
      return;
    }

    const result = await service.getAMCResult(
      req.session.id,
      res.locals.clientSessionId,
      res.locals.persistentSessionId,
      req,
      code,
      state
    );

    if (!result.success) {
      res.status(400).json({ error: `AMC callback failed: ${result.data}` });
      return;
    }

    res.status(200).json({ message: result.data });
  };
}
