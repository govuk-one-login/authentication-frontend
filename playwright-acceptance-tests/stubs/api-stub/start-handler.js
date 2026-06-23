var body = JSON.parse(context.request.body);

if (body.requested_credential_strength === "Cl") {
  respond()
    .withStatusCode(200)
    .withFile("responses/start-200-no-mfa.json")
    .skipDefaultBehaviour();
} else {
  respond()
    .withStatusCode(200)
    .withFile("responses/start-200.json")
    .skipDefaultBehaviour();
}
