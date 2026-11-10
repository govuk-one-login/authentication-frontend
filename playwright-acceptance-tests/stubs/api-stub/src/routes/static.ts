import type { Express } from "express";

export function registerStaticRoutes(app: Express): void {
  app.post("/send-notification", (_, res) => res.sendStatus(204));
  app.post("/update-profile", (_, res) => res.sendStatus(204));
  app.post("/check-reauth-user", (_, res) => res.sendStatus(200));

  app.post("/account-recovery", (_, res) =>
    res.json({ accountRecoveryPermitted: true })
  );
  app.post("/check-email-fraud-block", (_, res) =>
    res.json({ emailAddressBlockedStatus: false })
  );

  app.post("/start-passkey-assertion", (_, res) =>
    res.json({
      credentialGetOptions:
        '{"challenge":"stub-challenge","timeout":60000,"rpId":"localhost"}',
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
