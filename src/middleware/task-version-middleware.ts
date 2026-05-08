import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

let taskDefinitionRevision: string | undefined;

async function fetchTaskDefinitionRevision(): Promise<string | undefined> {
  const metadataUri = process.env.ECS_CONTAINER_METADATA_URI_V4;
  if (!metadataUri) return undefined;
  try {
    const res = await fetch(`${metadataUri}/task`);
    const metadata = await res.json();
    return metadata.Revision as string;
  } catch {
    return undefined;
  }
}

export async function initTaskVersion(): Promise<void> {
  taskDefinitionRevision = await fetchTaskDefinitionRevision();
  if (taskDefinitionRevision) {
    logger.info({ taskDefinitionRevision }, "ECS task version resolved A");
  }
}

export function taskVersionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (taskDefinitionRevision) {
    req.log.setBindings({ taskDefinitionRevision });
  }
  next();
}
