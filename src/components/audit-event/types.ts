import type { Request } from "express";

export type AuditEventQueueService = {
  sendAuditEvent: (req: Request) => Promise<void>;
};
