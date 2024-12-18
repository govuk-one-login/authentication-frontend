import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";
import nunjucks from "nunjucks";
import acorn from "acorn";
import walk from "acorn-walk";

// @ts-expect-error parser does exist, just not typed
const compiler = nunjucks.compiler as { compile: (path: string) => string };

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

    const file = fs.readFileSync(
      path.join(__dirname, "..", "components", view),
      { encoding: "utf8", flag: "r" }
    );
    const compiledTemplateJS = compiler.compile(file);
    const templateAST = acorn.parse(compiledTemplateJS, {
      ecmaVersion: "latest",
      allowReturnOutsideFunction: true,
    });

    const translationKeys = new Set<string>();
    const variableNames = new Set<string>();
    const variableNamesSetInTemplates = new Set<string>(["ga4OnPageLoad"]);
    walk.simple(templateAST, {
      CallExpression(node) {
        const calleeMethodName = (node?.callee as any)?.object?.callee?.property
          ?.name;
        const calleeMethodArgument = (node?.callee as any)?.object
          ?.arguments?.[0].value;
        const calleePropertyName = (node?.callee as any)?.property?.name;
        if (
          calleeMethodName === "getFilter" &&
          calleeMethodArgument === "translate"
        ) {
          translationKeys.add((node.arguments[1] as any)?.value);
        } else if (calleePropertyName === "contextOrFrameLookup") {
          variableNames.add((node.arguments[2] as any)?.value);
        } else if (calleePropertyName === "setVariable") {
          // @ts-expect-error value does actually exist
          variableNamesSetInTemplates.add(node.arguments[0]?.value);
        }
      },
    });

    variableNamesSetInTemplates.forEach((set) => variableNames.delete(set));

    req.log.debug(
      `template "${view}" looks up these properties ${JSON.stringify({
        variableNames: Array.from(variableNames),
        translationKeys: Array.from(translationKeys),
      })}`
    );

    _render.call(this, view, opts, done);
  };

  next();
}

function isCallbackFunction(
  options?: object | CallbackFunction
): options is CallbackFunction {
  return typeof options === "function";
}
