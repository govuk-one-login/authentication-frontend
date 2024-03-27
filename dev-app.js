// THIS IS FOR DEV TESTING ONLY

const express = require("express");
const axios = require("axios").default;
const url = require("url");
const querystring = require("querystring");
const { randomBytes } = require("crypto");
const app = express();
const port = process.env.PORT;

function createAuthorizeRequest() {
  const vtr = process.env.VTR ? "vtr=" + encodeURI(process.env.VTR) : "";

  return process.env.API_BASE_URL +
    "/authorize?" +
    vtr +
    "&scope=openid+phone+email" +
    "&response_type=code" +
    "&redirect_uri=https%3A%2F%2F" + process.env.STUB_HOSTNAME + "%2Foidc%2Fauthorization-code%2Fcallback" +
    "&state=" + randomBytes(32).toString("base64url") +
    "&nonce=" + randomBytes(32).toString("base64url") +
    "&client_id=" + process.env.TEST_CLIENT_ID +
    "&cookie_consent=accept" +
    "&_ga=test" +
    getUILocales();
}

app.get("/", (req, res) => {
  const authRequest = createAuthorizeRequest();
  console.log(authRequest);
  axios
    .get(authRequest, {
      validateStatus: (status) => {
        return status >= 200 && status <= 304;
      },
      maxRedirects: 0,
    })
    .then(function (response) {
      let sessionCookieValue;
      const sessionCookie = response.headers["set-cookie"][0];
      console.log("session cookie is", sessionCookie )
      if (sessionCookie) {
        sessionCookieValue = getCookieValue(sessionCookie.split(";"), "gs");
        res.cookie("gs", sessionCookieValue, {
          maxAge: new Date(new Date().getTime() + 60 * 60000),
        });
      }

      res.cookie("analytics", sessionCookieValue, {
        maxAge: new Date(new Date().getTime() + 60 * 60000),
      });

      let lngCookieValue;
      const lngCookie = response.headers["set-cookie"][2];
      if (lngCookie) {
        lngCookieValue = getCookieValue(lngCookie.split(";"), "lng");
        res.cookie("lng", lngCookieValue, {
          maxAge: new Date(new Date().getTime() + 60 * 60000),
        });
      }

      console.log(`Session is: ${sessionCookieValue}`);
      console.log(`lng is: ${lngCookieValue}`);

      const location = url.parse(response.headers.location, true);
      const redirect = "http://localhost:3000/authorize?" + querystring.stringify(location.query)

      console.log(`orch response location query is: ${redirect}`);

      res.redirect(
          redirect
      );
    })
    .catch(function (error) {
      console.error(error);
    });
});

app.listen(port, () => {
  console.log("TEST APP TO REDIRECT FOR NEW SESSION : DEV ONLY");
  console.log(`RUNNING ON http://localhost:${port}`);
});

function getCookieValue(cookie, cookieName) {
  let value;
  cookie.forEach((item) => {
    const name = item.split("=")[0].toLowerCase().trim();
    if (name.indexOf(cookieName) !== -1) {
      value = item.split("=")[1];
    }
  });
  return value;
}

function getUILocales() {
  const uiLocales = process.env.UI_LOCALES;
  if (uiLocales && uiLocales.length > 0) {
    return "&ui_locales=" + uiLocales;
  } else {
    return "";
  }
}
