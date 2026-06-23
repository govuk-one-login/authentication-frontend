var body = JSON.parse(context.request.body);
var store = stores.open("verifyMfaAttempts");
var count = store.load("default") || 0;

if (body.code === "999999") {
  count++;
  store.save("default", count);
  if (count >= 6) {
    var lockoutStore = stores.open("authAppLocked");
    lockoutStore.save("default", "locked");
    respond()
      .withStatusCode(400)
      .withContent('{"code":1042,"message":"Max auth app attempts reached"}')
      .skipDefaultBehaviour();
  } else {
    respond()
      .withStatusCode(400)
      .withContent('{"code":1043,"message":"Invalid auth app code"}')
      .skipDefaultBehaviour();
  }
} else {
  respond().withStatusCode(204).withEmpty().skipDefaultBehaviour();
}
