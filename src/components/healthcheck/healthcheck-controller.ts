import { Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../../app.constants";
import { logger } from "../../utils/logger";

export function healthcheckGet(req: Request, res: Response): void {
  logger.info(`Healthcheck returning 200 OK.`);
  res.status(HTTP_STATUS_CODES.OK).send("OK");
}
