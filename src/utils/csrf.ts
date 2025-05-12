import { csrfSync } from "csrf-sync";

const { csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => {
    console.log(`aaa getTokenFromRequest req.body["_csrf"] = ${req.body["_csrf"]}`)

    return req.body["_csrf"];
  },
});

export { csrfSynchronisedProtection };
