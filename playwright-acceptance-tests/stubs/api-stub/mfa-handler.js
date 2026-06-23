var store = stores.open("mfaResendCount");
var count = store.load("default") || 0;
count++;
store.save("default", count);

if (count > 5) {
  var lockoutStore = stores.open("smsResendLocked");
  lockoutStore.save("default", "locked");
  respond()
    .withStatusCode(400)
    .withContent('{"code":1025,"message":"Too many code requests"}')
    .skipDefaultBehaviour();
} else {
  respond().withStatusCode(204).withEmpty().skipDefaultBehaviour();
}
