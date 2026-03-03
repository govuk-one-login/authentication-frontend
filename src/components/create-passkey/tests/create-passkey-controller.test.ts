import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import type { ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createPasskeyGet } from "../create-passkey-controller.js";

describe("create passkey controller", () => {
  let res: ResponseOutput;

  beforeEach(() => {
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createPasskeyGet", () => {
    it("should render create passkey page", () => {
      createPasskeyGet({} as Request, res as Response);

      expect(res.render).to.have.been.calledWith("create-passkey/index.njk");
    });
  });
});
