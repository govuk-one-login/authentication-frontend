import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import {
  accountNotFoundGet,
  accountNotFoundPost,
} from "../account-not-found-controller.js";
import { PATH_NAMES, SERVICE_TYPE } from "../../../app.constants.js";
import type { SendNotificationServiceInterface } from "../../common/send-notification/types.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
describe("account not found controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.ACCOUNT_NOT_FOUND);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("accountNotFoundGet", () => {
    describe("when isApp is not defined", () => {
      it("should render the account not found mandatory view when serviceType undefined", () => {
        accountNotFoundGet(req, res);

        expect(res.render).to.have.calledWith("account-not-found/index-mandatory.njk");
      });

      it("should render the account not found optional view when serviceType optional", () => {
        req.session.client.serviceType = SERVICE_TYPE.OPTIONAL;
        accountNotFoundGet(req, res);

        expect(res.render).to.have.calledWith("account-not-found/index-optional.njk");
      });

      it("should render the account not found optional view when the service is part of One Login", () => {
        req.session.client.isOneLoginService = true;
        accountNotFoundGet(req, res);

        expect(res.render).to.have.calledWith("account-not-found/index-one-login.njk");
      });
    });

    describe("when isApp is false", () => {
      beforeEach(() => {
        res.locals.isApp = false;
      });

      it("should render the account not found mandatory view when serviceType undefined", () => {
        accountNotFoundGet(req, res);

        expect(res.render).to.have.calledWith("account-not-found/index-mandatory.njk");
      });

      it("should render the account not found optional view when serviceType optional", () => {
        req.session.client.serviceType = SERVICE_TYPE.OPTIONAL;
        accountNotFoundGet(req, res);

        expect(res.render).to.have.calledWith("account-not-found/index-optional.njk");
      });

      it("should render the account not found optional view when the service is part of One Login", () => {
        req.session.client.isOneLoginService = true;
        accountNotFoundGet(req, res);

        expect(res.render).to.have.calledWith("account-not-found/index-one-login.njk");
      });
    });

    describe("when isApp is true", () => {
      beforeEach(() => {
        res.locals.isApp = true;
      });

      it("should render the account not found mandatory view when serviceType undefined", () => {
        accountNotFoundGet(req, res);

        expect(res.render).to.have.calledWith("account-not-found/index-mobile.njk");
      });

      it("should render the account not found optional view when serviceType optional", () => {
        req.session.client.serviceType = SERVICE_TYPE.OPTIONAL;

        accountNotFoundGet(req, res);

        expect(res.render).to.have.calledWith("account-not-found/index-mobile.njk");
      });

      it("should render the account not found optional view when the service is part of One Login", () => {
        req.session.client.isOneLoginService = true;

        accountNotFoundGet(req, res);

        expect(res.render).to.have.calledWith("account-not-found/index-mobile.njk");
      });
    });
  });

  describe("accountNotFoundPost", () => {
    let fakeService: SendNotificationServiceInterface;

    beforeEach(() => {
      fakeService = {
        sendNotification: sinon.fake.returns({ success: true }),
      } as unknown as SendNotificationServiceInterface;
    });

    it("should redirect to /check-your-email when no account exists", async () => {
      req.body.email = "test.test.com";
      res.locals.sessionId = "sadl990asdald";

      await accountNotFoundPost(fakeService)(req, res);

      expect(req.session.user.isAccountCreationJourney).to.be.true;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.CHECK_YOUR_EMAIL);
      expect(fakeService.sendNotification).to.have.been.calledOnce;
    });

    it("should redirect to GOV.UK service sign-in page when One Login service", async () => {
      const fakeService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({ success: true }),
      } as unknown as SendNotificationServiceInterface;
      req.body.optionSelected = "sign-in-to-a-service";

      await accountNotFoundPost(fakeService)(req, res);

      expect(res.redirect).to.have.been.calledWith("https://www.gov.uk/sign-in");
      expect(fakeService.sendNotification).to.have.not.been.called;
    });
  });
});
