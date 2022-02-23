import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";

import {
  accountNotFoundGet,
  accountNotFoundPost,
} from "../account-not-found-controller";
import { PATH_NAMES, SERVICE_TYPE } from "../../../app.constants";
import { SendNotificationServiceInterface } from "../../common/send-notification/types";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("account not found controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.ACCOUNT_NOT_FOUND,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("accountNotFoundGet", () => {
    it("should render the account not found mandatory view when serviceType undefined", () => {
      accountNotFoundGet(req, res);

      expect(res.render).to.have.calledWith(
        "account-not-found/index-mandatory.njk"
      );
    });

    it("should render the account not found optional view when serviceType optional", () => {
      req.session.client.serviceType = SERVICE_TYPE.OPTIONAL;
      accountNotFoundGet(req, res);

      expect(res.render).to.have.calledWith(
        "account-not-found/index-optional.njk"
      );
    });

    it("should redirect to /check-your-email when no account exists", async () => {
      const fakeService: SendNotificationServiceInterface = {
        sendNotification: sinon.fake.returns({
          success: true,
        }),
      };

      req.body.email = "test.test.com";
      res.locals.sessionId = "sadl990asdald";

      await accountNotFoundPost(fakeService)(req, res);

      expect(res.redirect).to.have.calledWith(PATH_NAMES.CHECK_YOUR_EMAIL);
      expect(fakeService.sendNotification).to.have.been.calledOnce;
    });
  });
});
