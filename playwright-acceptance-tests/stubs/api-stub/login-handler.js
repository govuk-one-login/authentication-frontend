var body = JSON.parse(context.request.body);

// Check if locked out from SMS/auth app (for second-visit scenarios)
var smsCodeLocked = stores.open("smsCodeLocked").load("default");
var smsResendLocked = stores.open("smsResendLocked").load("default");
var authAppLocked = stores.open("authAppLocked").load("default");

if (
  smsCodeLocked === "locked" ||
  smsResendLocked === "locked" ||
  authAppLocked === "locked"
) {
  respond()
    .withStatusCode(400)
    .withContent('{"code":1045,"message":"Account locked"}')
    .skipDefaultBehaviour();
} else if (body.password === "wrong-password") {
  var store = stores.open("loginAttempts");
  var count = store.load("default") || 0;
  count++;
  store.save("default", count);
  if (count >= 6) {
    var lockoutStore = stores.open("accountLocked");
    lockoutStore.save("default", "locked");
    respond()
      .withStatusCode(400)
      .withContent('{"code":1028,"message":"Password attempt limit reached"}')
      .skipDefaultBehaviour();
  } else {
    respond()
      .withStatusCode(401)
      .withContent('{"code":1028,"message":"Invalid password"}')
      .skipDefaultBehaviour();
  }
} else if (body.email === "authapp@example.com") {
  respond()
    .withStatusCode(200)
    .withFile("responses/login-200-auth-app.json")
    .skipDefaultBehaviour();
} else if (body.email === "nomfa@example.com") {
  respond()
    .withStatusCode(200)
    .withFile("responses/login-200-no-mfa.json")
    .skipDefaultBehaviour();
} else {
  respond()
    .withStatusCode(200)
    .withFile("responses/login-200.json")
    .skipDefaultBehaviour();
}
