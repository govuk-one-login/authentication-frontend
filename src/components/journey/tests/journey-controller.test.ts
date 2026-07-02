import {
  mockResponse,
  type RequestOutput,
  type ResponseOutput,
} from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { PATH_NAMES } from "../../../app.constants.js";
import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import esmock from "esmock";

describe("journey controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.JOURNEY);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("journeyGet", () => {
    describe("success", () => {
      it("should redirect to next page when validation passes", async () => {
        const previousPage = "/previous-page";
        const event = "EVENT_TO_GO_NEXT_PAGE";
        const expectedNextPath = "/next-page";

        req.params = { event, page: "previous-page" };
        req.session.user = {
          journey: { nextPath: previousPage, optionalPaths: [] },
        };

        const { journeyGet, fakeGetNextPathAndUpdateJourney } =
          await setupStateMachineMock(previousPage, expectedNextPath, event);

        await journeyGet(req as Request, res as Response);

        expect(fakeGetNextPathAndUpdateJourney).to.have.been.calledWith(
          req,
          res,
          event,
          previousPage
        );
        expect(res.redirect).to.have.been.calledWith(expectedNextPath);
      });
    });

    describe("validation", () => {
      it("should not allow the use of /journey if previous page from session doesn't match previous page in route params", async () => {
        const previousPageInSession = "/some-page";
        const previousPageInRouteParams = "other-page";
        const event = "EVENT_TO_GO_NEXT_PAGE";
        const expectedNextPath = "/next-page";

        req.params = { event, page: previousPageInRouteParams };
        req.session.user = {
          journey: { nextPath: previousPageInSession, optionalPaths: [] },
        };

        const { journeyGet, fakeGetNextPathAndUpdateJourney } =
          await setupStateMachineMock(
            previousPageInRouteParams,
            expectedNextPath,
            event
          );

        await journeyGet(req as Request, res as Response);

        expect(fakeGetNextPathAndUpdateJourney).not.have.been.called;
        expect(res.redirect).to.have.been.calledWith(previousPageInSession);
      });

      [
        {
          page: undefined,
          event: "SOME_EVENT",
          description: "page is missing",
        },
        {
          page: "next-page",
          event: undefined,
          description: "event is missing",
        },
        {
          page: undefined,
          event: undefined,
          description: "both page and event are missing",
        },
      ].forEach(({ page, event, description }) => {
        it(`should redirect to previous page when ${description}`, async () => {
          const previousPageInSession = "/next-page";
          const expectedNextPath = "/next-page";

          req.params = { event, page };
          req.session.user = {
            journey: { nextPath: previousPageInSession, optionalPaths: [] },
          };

          const { journeyGet, fakeGetNextPathAndUpdateJourney } =
            await setupStateMachineMock(
              previousPageInSession,
              expectedNextPath,
              event
            );

          await journeyGet(req as Request, res as Response);

          expect(fakeGetNextPathAndUpdateJourney).not.have.been.called;
          expect(res.redirect).to.have.been.calledWith(previousPageInSession);
        });
      });
    });
  });

  const setupStateMachineMock = async (
    previousPage: string,
    expectedNextPath: string,
    event?: string
  ) => {
    const fakeGetNextPathAndUpdateJourney =
      sinon.fake.resolves(expectedNextPath);

    const { journeyGet } = await esmock("../journey-controller.js", {
      "../../common/state-machine/state-machine-executor.js": {
        getNextPathAndUpdateJourney: fakeGetNextPathAndUpdateJourney,
      },
      "../../common/state-machine/state-machine.js": {
        authStateMachine: {
          states: {
            [previousPage]: {
              meta: {
                allowedEventsFromJourney: event ? [event] : [],
              },
            },
          },
        },
      },
    });

    return { journeyGet, fakeGetNextPathAndUpdateJourney };
  };
});
