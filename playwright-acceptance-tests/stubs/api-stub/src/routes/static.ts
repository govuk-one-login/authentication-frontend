import type { Express } from "express";

const JWKS = {
  keys: [
    { kty: "RSA", kid: "stub-key-1", use: "sig", n: "stub-modulus", e: "AQAB" },
  ],
};

export function registerStaticRoutes(app: Express): void {
  app.get("/.well-known/mfa-reset-jwk.json", (_, res) => res.json(JWKS));
  app.get("/.well-known/reverification-jwk.json", (_, res) => res.json(JWKS));
  app.get("/.well-known/amc-jwks.json", (_, res) => res.json(JWKS));
  app.get("/.well-known/ad-jwks.json", (_, res) => res.json(JWKS));
  app.get("/.well-known/auth-jwks.json", (_, res) => res.json(JWKS));

  app.post("/send-notification", (_, res) => res.sendStatus(204));
  app.post("/update-profile", (_, res) => res.sendStatus(204));
  app.post("/reset-password", (_, res) => res.sendStatus(204));
  app.post("/check-reauth-user", (_, res) => res.sendStatus(200));

  app.post("/reset-password-request", (_, res) =>
    res.json({ mfaMethodType: "SMS", phoneNumberLastThree: "890" })
  );
  app.post("/account-interventions", (_, res) =>
    res.json({
      blocked: false,
      suspended: false,
      reproveIdentity: false,
      resetPassword: false,
    })
  );
  app.post("/account-recovery", (_, res) =>
    res.json({ accountRecoveryPermitted: true })
  );
  app.post("/check-email-fraud-block", (_, res) =>
    res.json({ emailAddressBlockedStatus: false })
  );
  app.post("/id-reverification-state", (_, res) =>
    res.json({ redirectUri: "http://localhost:3002/callback" })
  );
  app.post("/amc-authorize", (_, res) =>
    res.json({
      authorizeUrl: "http://localhost:3000/amc-authorize-redirect",
      cookie: "stub-amc-cookie",
    })
  );
  app.post("/amc-callback", (_, res) =>
    res.json({ journeyOutcome: "SUCCESS" })
  );
  app.post("/mfa-reset-authorize", (_, res) =>
    res.json({ redirectUri: "http://localhost:3000/mfa-reset-redirect" })
  );
  app.post("/reverification-result", (_, res) => res.json({ success: true }));
  app.post("/processing-identity", (_, res) =>
    res.json({ status: "COMPLETED" })
  );
  app.post("/start-passkey-assertion", (_, res) =>
    res.json({
      credentialGetOptions:
        '{"challenge":"stub-challenge","timeout":60000,"rpId":"localhost"}',
    })
  );
  app.post("/finish-passkey-assertion", (_, res) =>
    res.json({ success: true })
  );

  app.post("/start", (_, res) =>
    res.json({
      sessionId: "session-123",
      user: {
        upliftRequired: false,
        identityRequired: false,
        authenticated: false,
        mfaMethodType: "SMS",
        mfaRequired: true,
        isBlockedForReauth: false,
      },
      featureFlags: {},
    })
  );
  app.post("/user-exists", (_, res) =>
    res.json({ email: "test@example.com", doesUserExist: true })
  );
  app.post("/login", (_, res) =>
    res.json({
      redactedPhoneNumber: "****7890",
      mfaMethodType: "SMS",
      latestTermsAndConditionsAccepted: true,
      mfaRequired: true,
      mfaMethodVerified: true,
      passwordChangeRequired: false,
      mfaMethods: [
        {
          id: "stub-mfa-method-id",
          type: "SMS",
          priority: "DEFAULT",
          redactedPhoneNumber: "****7890",
        },
      ],
    })
  );
  app.post("/signup", (_, res) =>
    res.json({ email: "test@example.com", consentRequired: false })
  );
  app.post("/mfa", (_, res) => res.sendStatus(204));
  app.post("/verify-code", (_, res) => res.sendStatus(204));
  app.post("/verify-mfa-code", (_, res) => res.sendStatus(204));
  app.post("/orch-auth-code", (req, res) =>
    res.json({
      location: `http://proxy/orchestration-redirect?code=auth-code-123&state=${req.body?.state || ""}`,
    })
  );

  app.post("/token", (_, res) =>
    res.json({
      access_token: "740e5834-3a29-46b4-9a6f-16142fde533a",
      token_type: "bearer",
      expires_in: "3600",
    })
  );
  app.get("/userinfo", (_, res) =>
    res.json({ sub: "stub-subject-id", new_account: "true" })
  );
}
