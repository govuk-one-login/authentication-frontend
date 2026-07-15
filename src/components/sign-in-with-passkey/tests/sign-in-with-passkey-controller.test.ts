import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import {
  signInWithPasskeyGet,
  signInWithPasskeyPost,
} from "../sign-in-with-passkey-controller.js";
import type { PasskeyServiceInterface } from "../../common/passkey/types.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
import { strict as assert } from "assert";

describe("sign in with passkey controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.SIGN_IN_WITH_PASSKEY);
    res = mockResponse();
    res.locals.sessionId = commonVariables.sessionId;
    res.locals.clientSessionId = commonVariables.clientSessionId;
    res.locals.persistentSessionId = commonVariables.diPersistentSessionId;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("signInWithPasskeyGet", () => {
    it("should render the sign in with passkey view with authentication options on success", async () => {
      const mockData = {
        publicKey: {
          challenge: "dGVzdC1jaGFsbGVuZ2U",
          rpId: "localhost",
          allowCredentials: [{ type: "public-key", id: "credential-id-123" }],
          timeout: 60000,
          userVerification: "preferred",
        },
      };

      const fakePasskeyService = {
        startPasskeyAssertion: sinon.fake.returns({
          success: true,
          data: mockData,
        }),
      } as unknown as PasskeyServiceInterface;

      await signInWithPasskeyGet(fakePasskeyService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.been.calledWith(
        "sign-in-with-passkey/index.njk",
        {
          authenticationOptions: JSON.stringify(mockData.publicKey),
          isReauth: false,
        }
      );
    });

    it("should pass isReauth=true if running a reauth journey", async () => {
      const mockData = {
        publicKey: {
          test: "test",
        },
      };

      const fakePasskeyService = {
        startPasskeyAssertion: sinon.fake.returns({
          success: true,
          data: mockData,
        }),
      } as unknown as PasskeyServiceInterface;

      req.session.user.reauthenticate = "reauth";

      await signInWithPasskeyGet(fakePasskeyService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.been.calledWith(
        "sign-in-with-passkey/index.njk",
        {
          authenticationOptions: JSON.stringify(mockData.publicKey),
          isReauth: true,
        }
      );
    });

    it("should pass the correct session IDs to the passkey service", async () => {
      const fakePasskeyService = {
        startPasskeyAssertion: sinon.fake.returns({
          success: true,
          data: { message: "success", code: 200 },
        }),
      } as unknown as PasskeyServiceInterface;

      await signInWithPasskeyGet(fakePasskeyService)(
        req as Request,
        res as Response
      );

      expect(fakePasskeyService.startPasskeyAssertion).to.have.been.calledWith(
        commonVariables.sessionId,
        commonVariables.clientSessionId,
        commonVariables.diPersistentSessionId,
        req
      );
    });

    it("should throw an error when the passkey service returns unsuccessful", async () => {
      const fakePasskeyService: PasskeyServiceInterface = {
        startPasskeyAssertion: sinon.fake.returns({
          success: false,
          data: { message: "Session expired", code: 1000 },
        }),
      } as unknown as PasskeyServiceInterface;
      await assert.rejects(
        async () =>
          signInWithPasskeyGet(fakePasskeyService)(
            req as Request,
            res as Response
          ),
        Error,
        "StartPasskeyAssertionError: Session expired"
      );
      expect(res.render).to.not.have.been.called;
    });
  });

  describe("signInWithPasskeyPost", () => {
    it("should redirect to the next path when the passkey service returns success", async () => {
      const fakePasskeyService = {
        finishPasskeyAssertion: sinon.fake.returns({
          success: true,
        }),
      } as unknown as PasskeyServiceInterface;

      await signInWithPasskeyPost(fakePasskeyService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });

    it("should pass the authentication response from the request body to the passkey service", async () => {
      const authenticationResponse = {
        signedChallenge: "challenge",
      };
      req.body.authenticationResponse = authenticationResponse;
      const fakePasskeyService = {
        finishPasskeyAssertion: sinon.fake.returns({
          success: true,
        }),
      } as unknown as PasskeyServiceInterface;

      await signInWithPasskeyPost(fakePasskeyService)(
        req as Request,
        res as Response
      );

      expect(fakePasskeyService.finishPasskeyAssertion).to.have.been.calledWith(
        commonVariables.sessionId,
        commonVariables.clientSessionId,
        commonVariables.diPersistentSessionId,
        req,
        authenticationResponse
      );
    });

    it("should redirect to cannot sign in passkey when the passkey service returns unsuccessful", async () => {
      const fakePasskeyService = {
        finishPasskeyAssertion: sinon.fake.returns({
          success: false,
          data: { message: "Session expired", code: 1000 },
        }),
      } as unknown as PasskeyServiceInterface;

      await signInWithPasskeyPost(fakePasskeyService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(
        PATH_NAMES.CANNOT_SIGN_IN_PASSKEY
      );
    });

    it("should redirect to cannot sign in passkey when authenticationError is present", async () => {
      req.body.authenticationError = "NotAllowedError";

      const fakePasskeyService = {
        finishPasskeyAssertion: sinon.fake(),
      } as unknown as PasskeyServiceInterface;

      await signInWithPasskeyPost(fakePasskeyService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(
        PATH_NAMES.CANNOT_SIGN_IN_PASSKEY
      );
      expect(fakePasskeyService.finishPasskeyAssertion).to.not.have.been.called;
    });
  });
});
