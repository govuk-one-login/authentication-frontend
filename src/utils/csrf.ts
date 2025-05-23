import { csrfSync } from "csrf-sync";

const { csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => {
    return req.body["_csrf"];
  },
});

export { csrfSynchronisedProtection };
