import { getRequestTaxonomy } from "../utils/taxonomy";
import { NextFunction, Request, Response } from "express";

type CallbackFunction = (err: Error, html: string) => void;

export function getRequestTaxonomyMiddleware(
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
    const taxonomy = getRequestTaxonomy();

    let done = callback;
    let opts;

    if (isCallbackFunction(options)) {
      done = options;
      opts = taxonomy;
    } else {
      opts = options ? { ...options, ...taxonomy } : taxonomy;
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
