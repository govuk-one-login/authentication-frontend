import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../src/app.constants";
import nock = require("nock");

type AccountInterventionsFlags = {
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
