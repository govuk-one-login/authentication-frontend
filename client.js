const express = require("express");
const app = express();
const { auth } = require("express-openid-connect");
const crypto = require("crypto");

const startClient = async (
  port,
  scope,
  clientId,
  clientBaseUrl,
  issuerBaseURL,
  clientPrivateKey,
  isP2LevelOfConfidenceJourney
) => {
  app.use(
    auth({
      issuerBaseURL: issuerBaseURL,
      baseURL: clientBaseUrl,
      clientID: clientId,
      secret: crypto.randomBytes(20).toString("base64url"),
      clientAuthMethod: "private_key_jwt",
      clientAssertionSigningKey: clientPrivateKey,
      idTokenSigningAlg: "ES256",
      authRequired: true,
      authorizationParams: {
        response_type: "code",
        scope: scope,
        vtr: isP2LevelOfConfidenceJourney ? '["P2.Cl.Cm"]' : '["Cl.Cm"]',
      },
    })
  );
  app.get("/", async (req, res) => {
    const userinfo = await req.oidc.fetchUserInfo();
    res.json(userinfo);
  });
  return app.listen(port, () => {
    console.log("TEST LOCAL CLIENT : DEV ONLY");
    console.log(`RUNNING ON http://localhost:${port}`);
  });
};

startClient(
  process.env.PORT,
  "openid email phone",
  process.env.TEST_CLIENT_ID,
  `http://localhost:${process.env.PORT}`,
  process.env.API_BASE_URL,
  process.env.TEST_CLIENT_PRIVATE_KEY
);

module.exports = { startClient };
