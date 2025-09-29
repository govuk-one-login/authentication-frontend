import { getRequestTaxonomy } from "../utils/taxonomy.js";
import type { NextFunction, Request, Response } from "express";
import { getContentId } from "../utils/contentId.js";

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
    const contentId = getContentId(req);

    res.locals.analyticsProperties = {
      httpStatusCode: res.statusCode,
      contentId,
      taxonomy,
    };

    let done = callback;
    let opts;

    if (isCallbackFunction(options)) {
      done = options;
      opts = {};
    } else {
      opts = options ? { ...options } : {};
    }

    _render.call<Response, [string, object, CallbackFunction], void>(
      this,
      view,
      opts,
      done
    );
  };

  next();
}

function isCallbackFunction(
  options?: object | CallbackFunction
): options is CallbackFunction {
  return typeof options === "function";
}
