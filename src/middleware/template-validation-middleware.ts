import { NextFunction, Request, Response } from "express";

type CallbackFunction = (err: Error, html: string) => void;

export function templateValidationMiddleware(
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
    let done = callback;
    let opts;

    if (isCallbackFunction(options)) {
      done = options;
    } else {
      opts = options;
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
