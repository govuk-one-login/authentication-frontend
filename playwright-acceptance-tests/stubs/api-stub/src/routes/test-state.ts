import { Router } from "express";
import type { StubbedApiResponses } from "../stubbed-api-responses";
import { resetState, state } from "../state";

const testStateRouter = Router();

testStateRouter.delete("/", (_req, res) => {
  resetState();
  res.sendStatus(204);
});

testStateRouter.delete("/session", (_req, res) => {
  state.authenticated = false;
  state.authenticatedCredentialStrength = "";
  res.sendStatus(204);
});

testStateRouter.put("/account-interventions", (req, res) => {
  state.accountInterventions = req.body;
  res.sendStatus(201);
});

testStateRouter.put("/terms-and-conditions-not-accepted", (_req, res) => {
  state.latestTermsAndConditionsAccepted = false;
  res.sendStatus(201);
});

/**
 * Router for setting API-call responses from tests. Mounted at
 * /test/responses.
 *
 *   PUT /test/responses/:call   body: the response to return
 *
 * `:call` is a field of StubbedApiResponses (e.g. "startResponse"). The stub
 * ships with no default responses; a step sets each response it relies on.
 */
const testResponsesRouter = Router();

const VALID_CALLS: ReadonlySet<keyof StubbedApiResponses> = new Set([
  "startResponse",
  "loginResponse",
  "userExistsResponse",
  "signUpResponse",
  "mfaResponse",
  "verifyCodeResponse",
  "verifyMfaCodeResponse",
  "authenticationAuthCodeResponse",
  "accountInterventionsResponse",
]);

function isValidCall(call: string): call is keyof StubbedApiResponses {
  return VALID_CALLS.has(call as keyof StubbedApiResponses);
}

testResponsesRouter.put("/:call", (req, res) => {
  const { call } = req.params;
  if (!isValidCall(call)) {
    res.status(400).json({ message: `Unknown API call: ${call}` });
    return;
  }
  state.stubbedApiResponses[call] = req.body;
  res.sendStatus(201);
});

export { testStateRouter, testResponsesRouter };
