import { Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../../app.constants";

export function healthcheckGet(req: Request, res: Response): void {
  res.status(HTTP_STATUS_CODES.OK).send("OK");
}
