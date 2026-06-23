var body = JSON.parse(context.request.body);
var store = stores.open("verifyCodeAttempts");
var count = store.load("default") || 0;

if (body.code === "999999") {
  count++;
  store.save("default", count);
  if (count >= 6) {
    var lockoutStore = stores.open("smsCodeLocked");
    lockoutStore.save("default", "locked");
    respond()
      .withStatusCode(400)
      .withContent('{"code":1034,"message":"Max code attempts reached"}')
      .skipDefaultBehaviour();
  } else {
    respond()
      .withStatusCode(400)
      .withContent('{"code":1035,"message":"Invalid code"}')
      .skipDefaultBehaviour();
  }
} else {
  respond().withStatusCode(204).withEmpty().skipDefaultBehaviour();
}
