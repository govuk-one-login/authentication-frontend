import { csrfSync } from "csrf-sync";

const { csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => {
    return req.body["_csrf"];
  },
  // TODO: AUT-4272 PR 3: Remove this to re-enable csrf validation.
  skipCsrfProtection: (req) => {
    return true;
  },
});

export { csrfSynchronisedProtection };
