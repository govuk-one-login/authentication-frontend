import { validateSessionMiddleware } from "./session-middleware";
import { csrfMiddleware } from "./csrf-middleware";

export const basicMiddlewarePipeline = [
  validateSessionMiddleware,
  csrfMiddleware,
];
