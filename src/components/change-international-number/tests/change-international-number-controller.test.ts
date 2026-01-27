import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import {
  changeInternationalNumberGet,
  changeInternationalNumberPost,
} from "../change-international-number-controller.js";

describe("change international number controller", () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CHANGE_INTERNATIONAL_NUMBER);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("changeInternationalNumberGet", () => {
    it("should render the change international number page", () => {
      changeInternationalNumberGet(req, res);

      expect(res.render).to.have.calledWith(
        "change-international-number/index.njk"
      );
    });
  });

  describe("changeInternationalNumberPost", () => {
    it("should redirect with START_MFA_RESET event", async () => {
      req.session.user = {
        needsToChangeInternationalNumber: true,
      };
      req.path = PATH_NAMES.CHANGE_INTERNATIONAL_NUMBER;
      res.locals = {
        sessionId: "session-id",
      };

      await changeInternationalNumberPost(req, res);

      expect(res.redirect).to.have.been.calledOnce;
    });
  });
});
