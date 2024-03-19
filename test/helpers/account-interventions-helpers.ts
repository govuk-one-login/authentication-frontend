import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../src/app.constants";
import { AccountInterventionsInterface } from "../../src/components/account-intervention/types";
import nock = require("nock");
import sinon from "sinon";

export type AccountInterventionsFlags = {
  blocked: boolean;
  passwordResetRequired: boolean;
  temporarilySuspended: boolean;
  reproveIdentity: boolean;
};

export const setupAccountInterventionsResponse = (
  baseApi: string,
  flags: AccountInterventionsFlags,
  maybeDateTimeStamp?: string
) => {
  const dateTimeStamp =
    maybeDateTimeStamp === undefined ? nowDateTime() : maybeDateTimeStamp;
  nock(baseApi)
    .post(API_ENDPOINTS.ACCOUNT_INTERVENTIONS)
    .once()
    .reply(HTTP_STATUS_CODES.OK, {
      email: "joe.bloggs@test.com",
      passwordResetRequired: flags.passwordResetRequired,
      blocked: flags.blocked,
      temporarilySuspended: flags.temporarilySuspended,
      appliedAt: dateTimeStamp,
      reproveIdentity: flags.reproveIdentity
    });
};

const nowDateTime = () => {
  const d = new Date();
  return d.valueOf().toString();
};

export const noInterventions: AccountInterventionsFlags = {
  blocked: false,
  passwordResetRequired: false,
  temporarilySuspended: false,
  reproveIdentity: false
};

export function accountInterventionsFakeHelper(
  flags: AccountInterventionsFlags,
  maybeDateTimeStamp?: string
) {
  const dateTimeStamp =
    maybeDateTimeStamp === undefined ? nowDateTime() : maybeDateTimeStamp;
  return {
    accountInterventionStatus: sinon.fake.returns({
      data: {
        email: "joe.bloggs@test.com",
        passwordResetRequired: flags.passwordResetRequired,
        blocked: flags.blocked,
        temporarilySuspended: flags.temporarilySuspended,
        appliedAt: dateTimeStamp,
        reproveIdentity: flags.reproveIdentity
      },
    }),
  } as unknown as AccountInterventionsInterface;
}
