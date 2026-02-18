import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import {
  changeSecurityCodesSignInGet,
  changeSecurityCodesSignInPost,
} from "../change-security-codes-sign-in-controller.js";

describe("change-security-codes-sign-in controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = { body: {}, session: {} };
    const sendFake = sinon.fake();
    res = {
      render: sinon.fake(),
      status: sinon.fake.returns({ send: sendFake }),
      send: sendFake,
    };
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
    it("should return 200 status", () => {
      changeSecurityCodesSignInPost(req, res);

      expect(res.status).to.have.been.calledOnceWith(200);
      expect(res.send).to.have.been.calledOnce;
    });
  });
});
