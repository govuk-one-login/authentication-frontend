import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import {
  updatedTermsConditionsGet,
  updatedTermsConditionsPost,
} from "../updated-terms-conditions-controller.js";
import type { UpdateProfileServiceInterface } from "../../common/update-profile/types.js";
import { PATH_NAMES } from "../../../app.constants.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
describe("updated terms conditions controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;
  const { email } = commonVariables;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS);
    req.session.user.email = email;
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("updatedTermsCondsGet", () => {
    it("should render updated-terms-conditions page", async () => {
      await updatedTermsConditionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "updated-terms-conditions/index.njk"
      );
    });
  });

  describe("updatedTermsCondsPost", () => {
    it("should update profile and redirect to /auth-code on submit", async () => {
      const fakeService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.returns({
          success: true,
          sessionState: "UPDATED_TERMS_AND_CONDITIONS_ACCEPTED",
        }),
      } as unknown as UpdateProfileServiceInterface;

      req.path = PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS;

      await updatedTermsConditionsPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.updateProfile).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });
  });
});
