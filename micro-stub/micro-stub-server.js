// THIS IS FOR DEV TESTING ONLY

const express = require("express");
//const axios = require("axios").default;
const url = require("url");
const querystring = require("querystring");
const { randomBytes } = require("crypto");
const app = express();
const port = process.env.PORT;
const path = require("path");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get("/authorize", (req, res) => {
  const authRequest = getAuthorizeRequest(req.query);

  console.log("Query parameters passed from form:");
  console.table(req.query);

  console.log(
    "Selected options result in the following request to `/authorize`:"
  );
  console.log(authRequest);

  fetch(authRequest, {
    redirect: "manual",
  })
    .then(function (response) {
      const headers = response.headers;

      const gsCookieHeader = headers
        .get("set-cookie")
        ?.split(", ")
        .find((header) => header.includes("gs="));

      if (gsCookieHeader) {
        const gsCookieValue = gsCookieHeader.split(";")[0].split("gs=")[1];
        res.cookie("gs", gsCookieValue, {
          maxAge: new Date(new Date().getTime() + 60 * 60000),
        });
        console.log(`gs cookie vallue is: ${gsCookieValue}`);
      } else {
        console.log("gs cookie header not found.");
      }

      const locationHeader = headers.get("location");

      const locationHeaderUrl = url.parse(locationHeader, true);

      let localHostEquivalentRedirectUrl =
        "http://localhost:3000/?" +
        querystring.stringify(locationHeaderUrl.query);

      const lngCookieHeader = headers
        .get("set-cookie")
        ?.split(", ")
        .find((header) => header.includes("lng="));

      if (lngCookieHeader) {
        const lngCookieValue = lngCookieHeader.split(";")[0].split("lng=")[1];
        // res.cookie("lng", lngCookieValue, {
        //   maxAge: new Date(new Date().getTime() + 60 * 60000),
        // });
        console.log(`lng cookie value is: ${lngCookieValue}`);
        localHostEquivalentRedirectUrl += `lng=${lngCookieValue}`;
      } else {
        console.log("lng cookie header not found.");
      }

      res.redirect(localHostEquivalentRedirectUrl);
    })
    .catch(function (error) {
      console.error(error);
    });
});

app.listen(port, () => {
  console.log(`MICRO-STUB SERVER RUNNING ON http://localhost:${port}`);
});

function getAuthorizeRequest(queryParams) {
  return (
    process.env.API_BASE_URL +
    "/authorize?" +
    getVtr(queryParams) +
    "&scope=openid" +
    ` ${queryParams["scopes-phone"] ?? ""}` +
    ` ${queryParams["scopes-email"] ?? ""}` +
    "&response_type=code" +
    "&redirect_uri=https%3A%2F%2F" +
    process.env.STUB_HOSTNAME +
    "%2Foidc%2Fauthorization-code%2Fcallback" +
    "&state=" +
    randomBytes(32).toString("base64url") +
    "&nonce=" +
    randomBytes(32).toString("base64url") +
    "&client_id=" +
    process.env.TEST_CLIENT_ID +
    "&cookie_consent=accept" +
    "&_ga=test" +
    getUILocales(queryParams)
  );
}

function getVtr(queryParams) {
  const secondAuthenticationFactorRequested = queryParams["2fa"];
  if (secondAuthenticationFactorRequested === "Cl") {
    return "&vtr=[Cl]";
  }
  const levelOfConfidenceRequested = queryParams["loc"];
  if (!levelOfConfidenceRequested) {
    return "&vtr=[Cl.Cm]";
  }
  return `&vtr=[${secondAuthenticationFactorRequested}.${levelOfConfidenceRequested}]`;
}

function getUILocales(queryParams) {
  const uiLocales = queryParams["lng"];
  if (uiLocales) {
    return "&ui_locales=" + uiLocales;
  }
  return "";
}
