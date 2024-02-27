import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../src/app.constants";
import { AccountInterventionsInterface } from "../../src/components/account-intervention/types";
import nock = require("nock");
import sinon from "sinon";

export type AccountInterventionsFlags = {
  blocked: boolean;
  passwordResetRequired: boolean;
  temporarilySuspended: boolean;
};

export const setupAccountInterventionsResponse = (
  baseApi: string,
  flags: AccountInterventionsFlags
) => {
  nock(baseApi)
    .post(API_ENDPOINTS.ACCOUNT_INTERVENTIONS)
    .once()
    .reply(HTTP_STATUS_CODES.OK, {
      email: "joe.bloggs@test.com",
      passwordResetRequired: flags.passwordResetRequired,
      blocked: flags.blocked,
      temporarilySuspended: flags.temporarilySuspended,
    });
};

export const noInterventions: AccountInterventionsFlags = {
  blocked: false,
  passwordResetRequired: false,
  temporarilySuspended: false,
};

export function accountInterventionsFakeHelper(
  email: string,
  passwordResetRequired: boolean,
  blocked: boolean,
  temporarilySuspended: boolean
) {
  const fakeAccountInterventionsService: AccountInterventionsInterface = {
    accountInterventionStatus: sinon.fake.returns({
      data: {
        email: email,
        passwordResetRequired: passwordResetRequired,
        blocked: blocked,
        temporarilySuspended: temporarilySuspended,
      },
    }),
  } as unknown as AccountInterventionsInterface;
  return fakeAccountInterventionsService;
}
