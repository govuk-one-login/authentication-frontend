import express from "express";
import { startHandler } from "./routes/start.js";
import { loginHandler } from "./routes/login.js";
import { checkUserExistsHandler } from "./routes/check-user-exists.js";
import { signUpHandler } from "./routes/sign-up.js";
import { mfaHandler } from "./routes/mfa.js";
import { verifyCodeHandler } from "./routes/verify-code.js";
import { verifyMfaCodeHandler } from "./routes/verify-mfa-code.js";
import { authenticationAuthCodeHandler } from "./routes/authentication-auth-code.js";
import { resetPasswordRequestHandler } from "./routes/reset-password-request.js";
import { resetPasswordHandler } from "./routes/reset-password.js";
import { registerStaticRoutes } from "./routes/static.js";
import { accountInterventionsHandler } from "./routes/account-interventions";
import { testStateRouter, testResponsesRouter } from "./routes/test-state";

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  let responseBody: unknown;
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on("finish", () => {
    process.stdout.write(
      `${req.method} ${req.originalUrl} -> ${res.statusCode} ` +
        `req=${JSON.stringify(req.body)} ||| res=${JSON.stringify(responseBody)}\n`
    );
  });
  next();
});

app.post("/start", startHandler);
app.post("/login", loginHandler);
app.post("/user-exists", checkUserExistsHandler);
app.post("/signup", signUpHandler);
app.post("/mfa", mfaHandler);
app.post("/verify-code", verifyCodeHandler);
app.post("/verify-mfa-code", verifyMfaCodeHandler);
app.post("/orch-auth-code", authenticationAuthCodeHandler);
app.post("/account-interventions", accountInterventionsHandler);
app.post("/reset-password-request", resetPasswordRequestHandler);
app.post("/reset-password", resetPasswordHandler);
app.use("/test/state", testStateRouter);
app.use("/test/responses", testResponsesRouter);

registerStaticRoutes(app);

app.listen(8080, () =>
  process.stdout.write("API stub listening on port 8080\n")
);
