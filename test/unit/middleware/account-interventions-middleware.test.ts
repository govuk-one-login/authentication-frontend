import { describe } from "mocha";
import { mockRequest, mockResponse } from "mock-req-res";
import { PATH_NAMES } from "../../../src/app.constants";
import { NextFunction, Request, Response } from "express";
import { sinon } from "../../utils/test-utils";
import { Http } from "../../../src/utils/http";
import { expect } from "chai";
import { accountInterventionsMiddleware } from "../../../src/middleware/account-interventions-middleware";
import { getNextPathAndUpdateJourney } from "../../../src/components/common/constants";

describe("account interventions middleware", () => {
  const http = new Http();
  const next = sinon.fake() as unknown as NextFunction;
  const postStub = sinon.stub(http.client, "post");
  const req =  mockRequest({
    path: PATH_NAMES.ACCOUNT_INTERVENTIONS,
    session: { user: { email: "test@test.com" } },
  });

  function responseData(passwordRequired: boolean, blocked: boolean, temporarilySuspended: boolean) {
    return {
      data: {
        "passwordResetRequired": passwordRequired,
        "blocked": blocked,
        "temporarilySuspended": temporarilySuspended,
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
  }


  afterEach(() => {
    sinon.restore();
  });

  it("Should call next when the account interventions response indicates no interventions", async () => {
    const accountInterventionsResponse = responseData(false, false, false)

    postStub.resolves(Promise.resolve(accountInterventionsResponse));
    await accountInterventionsMiddleware(req, mockResponse(), next, http);

    expect(next).to.have.been.called;
  });

  //TODO: check * request will include the session-id, client-session-id and persistent-session-id in the header.
  //TODO: would be nice if the post stub specifically checked the data being called with
  //TODO: check the shape of the request - is session corect?
  //TODO not sure if headers in request etc should be set
});
