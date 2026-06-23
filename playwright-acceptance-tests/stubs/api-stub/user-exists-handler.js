var accountLocked = stores.open("accountLocked").load("default");
var smsCodeLocked = stores.open("smsCodeLocked").load("default");
var smsResendLocked = stores.open("smsResendLocked").load("default");
var authAppLocked = stores.open("authAppLocked").load("default");

if (
  accountLocked === "locked" ||
  smsCodeLocked === "locked" ||
  smsResendLocked === "locked" ||
  authAppLocked === "locked"
) {
  respond()
    .withStatusCode(400)
    .withContent('{"code":1045,"message":"Account locked"}')
    .skipDefaultBehaviour();
} else {
  respond()
    .withStatusCode(200)
    .withFile("responses/user-exists-200.json")
    .skipDefaultBehaviour();
}
