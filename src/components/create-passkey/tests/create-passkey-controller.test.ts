import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import type { ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import {
  createPasskeyGet,
  createPasskeyPost,
} from "../create-passkey-controller.js";

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

  describe("createPasskeyPost", () => {
    it("should set hasSkippedPasskeyRegistration when skip button is clicked", async () => {
      const req = {
        body: { createPasskeyOption: "skip" },
        session: {
          user: {},
          save: sinon.spy((callback) => callback(null)),
        },
        log: {
          debug: sinon.spy(),
          info: sinon.spy(),
        },
      } as unknown as Request;

      await createPasskeyPost(req, res as Response);

      expect(req.session.user.hasSkippedPasskeyRegistration).to.be.true;
      expect(req.session.save).to.have.been.called;
    });

    it("should not set hasSkippedPasskeyRegistration when submit button is clicked", async () => {
      const req = {
        body: { createPasskeyOption: "submit" },
        session: {
          user: {},
          save: sinon.spy((callback) => callback(null)),
        },
        log: {
          debug: sinon.spy(),
          info: sinon.spy(),
        },
      } as unknown as Request;

      await createPasskeyPost(req, res as Response);

      expect(req.session.user.hasSkippedPasskeyRegistration).to.be.undefined;
    });
  });
});
