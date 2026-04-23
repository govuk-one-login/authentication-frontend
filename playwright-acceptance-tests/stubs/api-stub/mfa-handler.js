var store = stores.open('mfaResendCount');
var key = 'default';
var count = Number(store.load(key)) || 0;
count++;
store.save(key, count);

if (count > 5) {
    stores.open('lockedOutMfa').save('test@example.com', 'resend');
    respond().withStatusCode(400)
        .withContent('{"code":1025,"message":"MFA SMS max codes sent"}')
        .skipDefaultBehaviour();
} else {
    respond().withStatusCode(204).withEmpty().skipDefaultBehaviour();
}
