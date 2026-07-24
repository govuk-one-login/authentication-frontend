import { Router } from "express";
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

export { testStateRouter };
