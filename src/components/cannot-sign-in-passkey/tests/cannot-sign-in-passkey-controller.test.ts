import { describe } from "mocha";
import { expect } from "chai";
import { strict as assert } from "assert";
import type { Request, Response } from "express";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import {
  cannotSignInPasskeyGet,
  cannotSignInPasskeyPost,
} from "../cannot-sign-in-passkey-controller.js";
import { sinon } from "../../../../test/utils/test-utils.js";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
import type { PasskeyServiceInterface } from "../../common/passkey/types.js";
import { CANNOT_SIGN_IN_PASSKEY_ACTION } from "../types.js";

describe("cannot sign in passkey controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY);
    res = mockResponse();
    res.locals.sessionId = commonVariables.sessionId;
    res.locals.clientSessionId = commonVariables.clientSessionId;
    res.locals.persistentSessionId = commonVariables.diPersistentSessionId;
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("cannotSignInPasskeyGet", () => {
    it("should render the cannot sign in passkey view with authentication options on success", async () => {
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

      await cannotSignInPasskeyGet(fakePasskeyService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.been.calledWith(
        "cannot-sign-in-passkey/index.njk",
        {
          authenticationOptions: JSON.stringify(mockData.publicKey),
          is2FAJourney: undefined,
          passkeySignInWebauthnError: undefined,
        }
      );
    });

    [true, false].forEach((isMfaRequired) => {
      it(`should pass is2FAJourney as ${isMfaRequired} when session isMfaRequired is ${isMfaRequired}`, async () => {
        req.session.user.isMfaRequired = isMfaRequired;

        const fakePasskeyService = {
          startPasskeyAssertion: sinon.fake.returns({
            success: true,
            data: {
              publicKey: { challenge: "dGVzdA" },
            },
          }),
        } as unknown as PasskeyServiceInterface;

        await cannotSignInPasskeyGet(fakePasskeyService)(
          req as Request,
          res as Response
        );

        expect(res.render).to.have.been.calledWith(
          "cannot-sign-in-passkey/index.njk",
          sinon.match({ is2FAJourney: isMfaRequired })
        );
      });
    });

    it("should pass the correct session IDs to the passkey service", async () => {
      const fakePasskeyService = {
        startPasskeyAssertion: sinon.fake.returns({
          success: true,
          data: { message: "success", code: 200 },
        }),
      } as unknown as PasskeyServiceInterface;

      await cannotSignInPasskeyGet(fakePasskeyService)(
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
          cannotSignInPasskeyGet(fakePasskeyService)(
            req as Request,
            res as Response
          ),
        Error,
        "StartPasskeyAssertionError: Session expired"
      );
      expect(res.render).to.not.have.been.called;
    });

    it("should pass a valid passkeySignInWebauthnError query param into the template", async () => {
      req.query.passkeySignInWebauthnError = "NotAllowedError";
      const fakePasskeyService = {
        startPasskeyAssertion: sinon.fake.returns({
          success: true,
          data: {
            publicKey: {},
          },
        }),
      } as unknown as PasskeyServiceInterface;

      await cannotSignInPasskeyGet(fakePasskeyService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.been.calledWith(
        "cannot-sign-in-passkey/index.njk",
        {
          authenticationOptions: "{}",
          is2FAJourney: undefined,
          passkeySignInWebauthnError: "NotAllowedError",
        }
      );
    });

    it("should not pass an invalid passkeySignInWebauthnError query param into the template", async () => {
      req.query.passkeySignInWebauthnError = "SomeInvalidError";
      const fakePasskeyService = {
        startPasskeyAssertion: sinon.fake.returns({
          success: true,
          data: {
            publicKey: {},
          },
        }),
      } as unknown as PasskeyServiceInterface;

      await cannotSignInPasskeyGet(fakePasskeyService)(
        req as Request,
        res as Response
      );

      expect(res.render).to.have.been.calledWith(
        "cannot-sign-in-passkey/index.njk",
        {
          authenticationOptions: "{}",
          is2FAJourney: undefined,
          passkeySignInWebauthnError: undefined,
        }
      );
    });
  });

  describe("cannotSignInPasskeyPost", () => {
    describe("retry passkey", () => {
      it("should redirect to the next path when finishPasskeyAssertion returns success", async () => {
        const fakePasskeyService = {
          finishPasskeyAssertion: sinon.fake.returns({
            success: true,
          }),
        } as unknown as PasskeyServiceInterface;

        await cannotSignInPasskeyPost(fakePasskeyService)(
          req as Request,
          res as Response
        );

        expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
      });

      it("should redirect to enter-password when user selects sign in without passkey option", async () => {
        req.body["cannot-sign-in-passkey-action"] =
          CANNOT_SIGN_IN_PASSKEY_ACTION.SIGN_IN_WITHOUT_PASSKEY;

        const fakePasskeyService = {
          finishPasskeyAssertion: sinon.fake.returns({
            success: true,
          }),
        } as unknown as PasskeyServiceInterface;

        await cannotSignInPasskeyPost(fakePasskeyService)(
          req as Request,
          res as Response
        );

        expect(fakePasskeyService.finishPasskeyAssertion).to.not.have.been
          .called;
        expect(res.redirect).to.have.been.calledWith(PATH_NAMES.ENTER_PASSWORD);
      });

      it("should pass the authenticationResponse from the request body to finishPasskeyAssertion", async () => {
        const authenticationResponse = {
          signedChallenge: "challenge",
        };
        req.body.authenticationResponse = authenticationResponse;
        const fakePasskeyService = {
          finishPasskeyAssertion: sinon.fake.returns({
            success: true,
          }),
        } as unknown as PasskeyServiceInterface;

        await cannotSignInPasskeyPost(fakePasskeyService)(
          req as Request,
          res as Response
        );

        expect(
          fakePasskeyService.finishPasskeyAssertion
        ).to.have.been.calledWith(
          commonVariables.sessionId,
          commonVariables.clientSessionId,
          commonVariables.diPersistentSessionId,
          req,
          authenticationResponse
        );
      });

      it("should redirect back to cannot-sign-in-passkey when finishPasskeyAssertion returns unsuccessful", async () => {
        const fakePasskeyService = {
          finishPasskeyAssertion: sinon.fake.returns({
            success: false,
            data: { message: "Session expired", code: 1000 },
          }),
        } as unknown as PasskeyServiceInterface;

        await cannotSignInPasskeyPost(fakePasskeyService)(
          req as Request,
          res as Response
        );

        expect(res.redirect).to.have.been.calledWith(
          PATH_NAMES.CANNOT_SIGN_IN_PASSKEY
        );
      });

      it("should redirect back to cannot-sign-in-passkey with passkeySignInWebauthnError query param when authenticationError exists", async () => {
        req.body.authenticationError = "NotAllowedError";
        const fakePasskeyService = {
          finishPasskeyAssertion: sinon.fake.returns({
            success: true,
          }),
        } as unknown as PasskeyServiceInterface;

        await cannotSignInPasskeyPost(fakePasskeyService)(
          req as Request,
          res as Response
        );

        expect(res.redirect).to.have.been.calledWith(
          `${PATH_NAMES.CANNOT_SIGN_IN_PASSKEY}?passkeySignInWebauthnError=NotAllowedError`
        );
      });
    });
  });
});
