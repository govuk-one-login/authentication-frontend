import type { Locals } from "express";
import { sinon } from "../utils/test-utils.js";
import type {
  RequestOutput,
  ResponseOutput,
  ResponsePayload,
} from "mock-req-res";
import { mockRequest, mockResponse } from "mock-req-res";
import { commonVariables } from "./common-test-variables.js";

export interface MockRequestOptions {
  headers?: any;
  session?: any;
  cookies?: any;
}

export function createMockRequest(
  pathName: string,
  options?: MockRequestOptions
): RequestOutput {
  const request = mockRequest({
    path: pathName,
    session: {
      client: {
        journeyId: commonVariables.journeyId,
      },
      user: {},
      save: (callback: () => Promise<void>) => callback(),
    },
    log: {
      info: sinon.fake(),
      debug: sinon.fake(),
      warn: sinon.fake(),
      error: sinon.fake(),
      setBindings: sinon.fake(),
    },
    t: sinon.fake(),
    i18n: { language: "en" },
    headers: {},
  });
  if (options?.headers) {
    request.headers = options.headers;
  }
  if (request.headers["x-forwarded-for"]) {
    request.ip = options?.headers["x-forwarded-for"];
  }
  if (options?.session) {
    request.session = options.session;
  }
  if (options?.cookies) {
    request.cookies = options.cookies;
  }
  return request;
}

export function createMockResponse(options?: ResponsePayload): ResponseOutput {
  return mockResponse({
    locals: {
      sessionId: commonVariables.sessionId,
      persistentSessionId: commonVariables.diPersistentSessionId,
    } satisfies Locals,
    ...options,
  });
}
