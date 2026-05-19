# Generate WebAuthn Passkey for Manual Testing

This script generates JavaScript that, when run in a browser console, triggers passkey creation via the WebAuthn API and outputs a DynamoDB JSON record ready to be inserted into the authenticator table.

## Why this exists

To test passkey sign-in in non-production environments, you need:

1. A passkey registered against the correct domain (e.g. `dev.account.gov.uk`)
2. A corresponding record in the DynamoDB `authenticator` table

The browser only allows passkey creation from the correct origin, so you must trigger the WebAuthn API while on that domain. This script lets you do that from the browser console without needing the full registration flow to be built.

## Prerequisites

- Python 3
- A browser open on the target environment's domain (e.g. `https://dev.account.gov.uk/sign-in-or-create`)
- A passkey authenticator available to the browser (hardware key, platform authenticator, or a virtual authenticator browser extension for dev testing)
- Access to the AWS DynamoDB `authenticator` table for the target environment

## Configuration

Edit the variables at the top of `generate_webauthn_script.py`:

| Variable          | Description                                                    |
| ----------------- | -------------------------------------------------------------- |
| `ENV_NAME`        | Display name for the environment (e.g. `"Dev"`)                |
| `ENV_URL`         | Subdomain prefix (e.g. `"dev"` for `dev.account.gov.uk`)       |
| `USER_PUB_SUB_ID` | The user's public subject ID, found in the user profile table  |
| `USER_EMAIL`      | The user's email address                                       |
| `CHALLENGE`       | A Base64URL-encoded challenge string (can be any random value) |

## Usage

1. **Run the script locally** to generate the JavaScript snippet:

   ```bash
   python generate_webauthn_script.py | pbcopy
   ```

2. **Open your browser** to a page on the target domain (e.g. `https://dev.account.gov.uk/sign-in-or-create`).

3. **Paste the JavaScript into the browser's Dev Tools console** and press Enter.

4. **Complete the passkey creation prompt** in your browser/authenticator. The script will log a JSON object to the console on success.

5. **Copy the JSON output** from the console.

6. **Insert the JSON as a new item** in the environment's DynamoDB `authenticator` table (e.g. via the AWS Console's "Create item" → JSON view, or the AWS CLI).

You now have a passkey you can sign in with.

## What the output looks like

The script outputs a DynamoDB JSON item with this structure:

```json
{
  "PublicSubjectID": { "S": "..." },
  "SK": { "S": "PASSKEY#<credential-id>" },
  "Created": { "S": "<timestamp>" },
  "Credential": { "S": "<base64url-encoded-public-key>" },
  "CredentialId": { "S": "<credential-id>" },
  "PasskeyAaguid": { "S": "<aaguid-uuid>" },
  "PasskeyBackedUp": { "BOOL": true },
  "PasskeyBackupEligible": { "BOOL": true },
  "PasskeyIsAttested": { "BOOL": true },
  "PasskeyIsResidentKey": { "BOOL": true },
  "PasskeySignCount": { "N": "0" },
  "PasskeyTransports": { "L": [{ "S": "internal" }] }
}
```

All values are derived from the actual passkey creation response — no data is fabricated.
