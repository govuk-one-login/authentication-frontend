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
import type { SignInWithPasskeyInterface } from "../types.js";
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

      const fakeStartSignInService = {
        startPasskeyAssertion: sinon.fake.returns({
          success: true,
          data: mockData,
        }),
      } as unknown as SignInWithPasskeyInterface;

      await signInWithPasskeyGet(fakeStartSignInService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.been.calledWith(
        "sign-in-with-passkey/index.njk",
        { authenticationOptions: JSON.stringify(mockData.publicKey) }
      );
    });

    it("should pass the correct session IDs to the start service", async () => {
      const fakeStartSignInService = {
        startPasskeyAssertion: sinon.fake.returns({
          success: true,
          data: { message: "success", code: 200 },
        }),
      } as unknown as SignInWithPasskeyInterface;

      await signInWithPasskeyGet(fakeStartSignInService)(
        req as Request,
        res as Response
      );

      expect(
        fakeStartSignInService.startPasskeyAssertion
      ).to.have.been.calledWith(
        commonVariables.sessionId,
        commonVariables.clientSessionId,
        commonVariables.diPersistentSessionId,
        req
      );
    });

    it("should throw an error when the start service returns unsuccessful", async () => {
      const fakeStartSignInService: SignInWithPasskeyInterface = {
        startPasskeyAssertion: sinon.fake.returns({
          success: false,
          data: { message: "Session expired", code: 1000 },
        }),
      } as unknown as SignInWithPasskeyInterface;
      await assert.rejects(
        async () =>
          signInWithPasskeyGet(fakeStartSignInService)(
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
    it("should redirect to the next path when the finish service returns success", async () => {
      const fakeFinishSignInService = {
        finishPasskeyAssertion: sinon.fake.returns({
          success: true,
        }),
      } as unknown as SignInWithPasskeyInterface;

      await signInWithPasskeyPost(fakeFinishSignInService)(
        req as Request,
        res as Response
      );

      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });

    it("should pass the authentication response from the request body to the finish service", async () => {
      const authenticationResponse = {
        signedChallenge: "challenge",
      };
      req.body.authenticationResponse = authenticationResponse;
      const fakeFinishSignInService = {
        finishPasskeyAssertion: sinon.fake.returns({
          success: true,
        }),
      } as unknown as SignInWithPasskeyInterface;

      await signInWithPasskeyPost(fakeFinishSignInService)(
        req as Request,
        res as Response
      );

      expect(
        fakeFinishSignInService.finishPasskeyAssertion
      ).to.have.been.calledWith(
        commonVariables.sessionId,
        commonVariables.clientSessionId,
        commonVariables.diPersistentSessionId,
        req,
        authenticationResponse
      );
    });

    it("should throw an error when the finish service returns unsuccessful", async () => {
      const fakeFinishSignInService = {
        finishPasskeyAssertion: sinon.fake.returns({
          success: false,
          data: { message: "Session expired", code: 1000 },
        }),
      } as unknown as SignInWithPasskeyInterface;

      await assert.rejects(
        async () =>
          signInWithPasskeyPost(fakeFinishSignInService)(
            req as Request,
            res as Response
          ),
        Error,
        "FinishPasskeyAssertionError: Session expired"
      );
      expect(res.redirect).to.not.have.been.called;
    });
  });
});
