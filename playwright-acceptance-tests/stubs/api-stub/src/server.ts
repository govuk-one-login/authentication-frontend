import express from "express";
import { startHandler } from "./routes/start.js";
import { loginHandler } from "./routes/login.js";
import { checkUserExistsHandler } from "./routes/check-user-exists.js";
import { signUpHandler } from "./routes/sign-up.js";
import { mfaHandler } from "./routes/mfa.js";
import { verifyCodeHandler } from "./routes/verify-code.js";
import { verifyMfaCodeHandler } from "./routes/verify-mfa-code.js";
import { authenticationAuthCodeHandler } from "./routes/authentication-auth-code.js";
import { registerStaticRoutes } from "./routes/static.js";
import { accountInterventionsHandler } from "./routes/account-interventions";
import { testStateRouter } from "./routes/test-state";

const app = express();
app.use(express.json());

app.post("/start", startHandler);
app.post("/login", loginHandler);
app.post("/user-exists", checkUserExistsHandler);
app.post("/signup", signUpHandler);
app.post("/mfa", mfaHandler);
app.post("/verify-code", verifyCodeHandler);
app.post("/verify-mfa-code", verifyMfaCodeHandler);
app.post("/orch-auth-code", authenticationAuthCodeHandler);
app.post("/account-interventions", accountInterventionsHandler);
app.use("/test/state", testStateRouter);

registerStaticRoutes(app);

app.listen(8080, () =>
  process.stdout.write("API stub listening on port 8080\n")
);
