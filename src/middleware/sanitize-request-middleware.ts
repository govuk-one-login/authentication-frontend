import { NextFunction, Request, Response } from "express";

import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

export function sanitizeRequestMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.body) {
    Object.keys(req.body).forEach((formParameter) => {
      req.body[formParameter] = DOMPurify.sanitize(req.body[formParameter], {
        ALLOWED_TAGS: [],
      }).trim();
    });
  }

  next();
}
