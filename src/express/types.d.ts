import 'express-serve-static-core';

declare global {
  namespace Express {
    interface Locals {
      sessionId: string;
      strategicAppChannel: boolean;
      webChannel: boolean;
      genericAppChannel: boolean;
      isApp: boolean
    }
    interface Response {
      locals: Locals;
    }
  }
}
