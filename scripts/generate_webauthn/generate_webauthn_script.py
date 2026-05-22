# --- CONFIGURATION: Update these values ---
ENV_NAME = "Dev"
ENV_URL = "dev.account.gov.uk"  # e.g., 'build.account.gov.uk' for build (see README for examples)
USER_PUB_SUB_ID = "xxx"
USER_EMAIL = "xxx@xxx.xxx"
CHALLENGE = "6EP1s53M5sF7XL_G2RwbY-AbJoSNiiCIVb9DrNNITnM"  # Base64URL encoded
# ------------------------------------------

js_template = f"""
(async () => {{
    const bufferFromBase64 = (base64) => {{
        const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
        return Uint8Array.from(binary, c => c.charCodeAt(0));
    }};

    const base64FromBuffer = (buffer) => {{
        return btoa(String.fromCharCode(...new Uint8Array(buffer)))
            .replace(/\\+/g, '-')
            .replace(/\\//g, '_')
            .replace(/=/g, '');
    }};

    const formatAaguid = (buffer) => {{
        const hex = [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
        return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
    }};

    const parseAttestation = (buffer) => {{
        const view = new Uint8Array(buffer);
        const pattern = [0x68, 0x61, 0x75, 0x74, 0x68, 0x44, 0x61, 0x74, 0x61]; // "authData"
        let offset = -1;
        for (let i = 0; i < view.length - pattern.length; i++) {{
            if (pattern.every((byte, j) => view[i + j] === byte)) {{
                offset = i + pattern.length; break;
            }}
        }}
        if (offset === -1) return null;
        let dataStart = view[offset] === 0x58 ? offset + 2 : view[offset] === 0x59 ? offset + 3 : offset + 1;
        const authData = view.slice(dataStart);
        return {{
            authData,
            publicKey: authData.slice(55 + ((authData[53] << 8) + authData[54])),
            aaguid: authData.slice(37, 53)
        }};
    }};

    const createOptions = {{
        challenge: bufferFromBase64("{CHALLENGE}"),
        rp: {{ name: "GOV.UK One Login ({ENV_NAME})", id: "{ENV_URL}" }},
        user: {{ id: new TextEncoder().encode("{USER_PUB_SUB_ID}"), name: "{USER_EMAIL}", displayName: "" }},
        pubKeyCredParams: [{{ alg: -8, type: "public-key" }}, {{ alg: -7, type: "public-key" }}, {{ alg: -257, type: "public-key" }}],
        timeout: 60000,
        attestation: "direct",
        authenticatorSelection: {{ residentKey: "required", userVerification: "required", requireResidentKey: true }},
        extensions: {{ credProps: true }}
    }};

    console.log("🚀 Triggering Passkey creation...");

    try {{
        const credential = await navigator.credentials.create({{ publicKey: createOptions }});
        const {{ response }} = credential;
        const extResults = credential.getClientExtensionResults();

        let authData, publicKey, aaguid;
        if (response.getAuthenticatorData) {{
            authData = new Uint8Array(response.getAuthenticatorData());
            publicKey = new Uint8Array(response.getPublicKey());
            aaguid = authData.slice(37, 53);
        }} else {{
            const parsed = parseAttestation(response.attestationObject);
            authData = parsed.authData;
            publicKey = parsed.publicKey;
            aaguid = parsed.aaguid;
        }}

        // GENUINE SIGN COUNT: Bytes 33-36 of authData (Big-Endian)
        const signCount = (authData[33] << 24) | (authData[34] << 16) | (authData[35] << 8) | (authData[36]);

        // GENUINE RESIDENT KEY: Check credProps extension, fallback to true if creation succeeded with "required"
        const isResidentKey = extResults.credProps ? !!extResults.credProps.rk : true;

        const flags = authData[32];
        const now = new Date();
        const timestamp = now.toISOString().replace('T', ':').replace('Z', '').slice(0, -1);
        const transports = (response.getTransports ? response.getTransports() : (credential.getTransports ? credential.getTransports() : ["internal"]));

        const dynamoJson = {{
            "PublicSubjectID": {{ "S": "{USER_PUB_SUB_ID}" }},
            "SK": {{ "S": `PASSKEY#${{credential.id}}` }},
            "Created": {{ "S": timestamp }},
            "Credential": {{ "S": base64FromBuffer(publicKey) }},
            "CredentialId": {{ "S": credential.id }},
            "PasskeyAaguid": {{ "S": formatAaguid(aaguid) }},
            "PasskeyBackedUp": {{ "BOOL": !!(flags & 0x10) }},
            "PasskeyBackupEligible": {{ "BOOL": !!(flags & 0x08) }},
            "PasskeyIsAttested": {{ "BOOL": !!response.attestationObject }},
            "PasskeyIsResidentKey": {{ "BOOL": isResidentKey }},
            "PasskeySignCount": {{ "N": signCount.toString() }},
            "PasskeyTransports": {{ "L": transports.map(t => ({{ "S": t }})) }}
        }};

        console.log("✅ Success! All genuine data captured.");
        console.log(JSON.stringify(dynamoJson, null, 2));
    }} catch (err) {{
        console.error("❌ Error:", err);
    }}
}})();
"""

print(js_template)
