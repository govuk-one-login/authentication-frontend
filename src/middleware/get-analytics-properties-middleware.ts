import { getRequestTaxonomy } from "../utils/taxonomy";
import { NextFunction, Request, Response } from "express";
import { getContentId } from "../utils/contentId";
import { CONTENT_IDS } from "../app.constants";

type CallbackFunction = (err: Error, html: string) => void;

export function getAnalyticsPropertiesMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const _render = res.render;

  res.render = function (
    view: string,
    options?: object | CallbackFunction,
    callback?: CallbackFunction
  ) {
    const taxonomy = getRequestTaxonomy(req);
    const contentId = getContentId(req, CONTENT_IDS);

    let done = callback;
    let opts;

    if (isCallbackFunction(options)) {
      done = options;
      opts = { contentId, ...taxonomy };
    } else {
      opts = options
        ? { contentId, ...options, ...taxonomy }
        : { contentId, ...taxonomy };
    }

    _render.call(this, view, opts, done);
  };

  next();
}

function isCallbackFunction(
  options?: object | CallbackFunction
): options is CallbackFunction {
  return typeof options === "function";
}