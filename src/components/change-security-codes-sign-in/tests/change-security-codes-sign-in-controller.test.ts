import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { mockResponse } from "mock-req-res";
import { fakeAccountRecoveryService } from "../../common/account-recovery/tests/account-recovery-helper.test.js";
import {
  changeSecurityCodesSignInGet,
  changeSecurityCodesSignInPost,
} from "../change-security-codes-sign-in-controller.js";

describe("change-security-codes-sign-in controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN);
    res = mockResponse({
      locals: {
        sessionId: "test-session-id",
      },
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("changeSecurityCodesSignInGet", () => {
    it("should render the change-security-codes-sign-in template", () => {
      changeSecurityCodesSignInGet(req, res);

      expect(res.render).to.have.been.calledOnceWith(
        "change-security-codes-sign-in/index.njk"
      );
    });
  });

  describe("changeSecurityCodesSignInPost", () => {
    it("should set isAccountRecoveryJourney and redirect to GET_SECURITY_CODES when permitted", async () => {
      await changeSecurityCodesSignInPost(fakeAccountRecoveryService(true))(
        req,
        res
      );

      expect(req.session.user.isAccountRecoveryJourney).to.be.true;
      expect(req.session.user.isAccountRecoveryPermitted).to.be.true;
      expect(res.redirect).to.have.been.calledOnceWith(
        PATH_NAMES.GET_SECURITY_CODES
      );
    });

    it("should render generic error when account recovery not permitted", async () => {
      await changeSecurityCodesSignInPost(fakeAccountRecoveryService(false))(
        req,
        res
      );

      expect(req.session.user.isAccountRecoveryJourney).to.be.true;
      expect(req.session.user.isAccountRecoveryPermitted).to.be.false;
      expect(res.render).to.have.been.calledOnceWith(
        "common/errors/generic-error.njk"
      );
    });
  });
});
