import { expect } from "chai";
import { describe } from "mocha";
import type { Request, Response } from "express";
import { sinon } from "../../utils/test-utils";
import { migrateMfaSessionStorageMiddleware } from "../../../src/middleware/migrate-mfa-session-storage-middleware";
import type { UserSession } from "../../../src/types";
import { MfaMethodPriorityIdentifier } from "../../../src/types";
import { MFA_METHOD_TYPE } from "../../../src/app.constants";
import type { Session } from "express-session";

describe("migrateMfaSessionStorageMiddleware", () => {
  let request: Request;
  const response = {} as Response;
  let next: () => void;

  beforeEach(() => {
    request = {} as Request;
    next = sinon.fake();
  });

  it("should call next", () => {
    migrateMfaSessionStorageMiddleware(request, response, next);
    expect(next).to.have.been.called;
  });

  it("does not migrate if mfaMethods exists in user session", () => {
    const expectedUserSession: UserSession = {
      phoneNumber: "01234567890",
      redactedPhoneNumber: "089",
      mfaMethods: [
        {
          type: MFA_METHOD_TYPE.SMS,
          priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
          phoneNumber: "555555555555",
          redactedPhoneNumber: "555",
        },
      ],
    };
    request.session = {
      user: expectedUserSession,
    } as any as Session;
    migrateMfaSessionStorageMiddleware(request, response, next);
    expect(request.session.user).to.deep.equals(expectedUserSession);
  });

  [
    {
      existingUserSession: {
        phoneNumber: "01234567890",
      },
      expectedUserSession: {
        phoneNumber: "01234567890",
        mfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
            phoneNumber: "01234567890",
          },
        ],
      },
    },
    {
      existingUserSession: {
        redactedPhoneNumber: "890",
      },
      expectedUserSession: {
        redactedPhoneNumber: "890",
        mfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
            redactedPhoneNumber: "890",
          },
        ],
      },
    },
    {
      existingUserSession: {
        phoneNumber: "01234567890",
        redactedPhoneNumber: "890",
      },
      expectedUserSession: {
        phoneNumber: "01234567890",
        redactedPhoneNumber: "890",
        mfaMethods: [
          {
            type: MFA_METHOD_TYPE.SMS,
            priorityIdentifier: MfaMethodPriorityIdentifier.DEFAULT,
            phoneNumber: "01234567890",
            redactedPhoneNumber: "890",
          },
        ],
      },
    },
  ].forEach(({ existingUserSession, expectedUserSession }) =>
    it(`correctly migrates session with keys ${JSON.stringify(Object.keys(existingUserSession))}`, () => {
      request.session = { user: existingUserSession } as any as Session;
      migrateMfaSessionStorageMiddleware(request, response, next);
      expect(request.session.user).to.deep.equals(expectedUserSession);
    })
  );
});
