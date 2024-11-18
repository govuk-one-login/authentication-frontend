import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";

export function ipvCallbackGet(): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    res.status(200).send("Got to ipv callback");
  };
}
