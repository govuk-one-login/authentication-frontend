import { validateSessionMiddleware } from "./session-middleware";

export const basicMiddlewarePipeline = [validateSessionMiddleware];
