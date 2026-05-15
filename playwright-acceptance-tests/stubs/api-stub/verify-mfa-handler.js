var body = JSON.parse(context.request.body);
var code = body.code;

if (code === '123456') {
    stores.open('authenticated').save('default', true);
    respond().withStatusCode(204).withEmpty().skipDefaultBehaviour();
} else {
    var store = stores.open('verifyMfaAttempts');
    var count = Number(store.load('default')) || 0;
    count++;
    store.save('default', count);

    if (count >= 6) {
        if (body.mfaMethodType === 'AUTH_APP') {
            stores.open('lockedOutMfa').save('authapp@example.com', 'code');
            respond().withStatusCode(400)
                .withContent('{"code":1042,"message":"Auth app invalid code max attempts reached"}')
                .skipDefaultBehaviour();
        } else {
            stores.open('lockedOutMfa').save('test@example.com', 'code');
            respond().withStatusCode(400)
                .withContent('{"code":1027,"message":"Entered invalid MFA max times"}')
                .skipDefaultBehaviour();
        }
    } else {
        if (body.mfaMethodType === 'AUTH_APP') {
            respond().withStatusCode(400)
                .withContent('{"code":1043,"message":"Auth app invalid code"}')
                .skipDefaultBehaviour();
        } else {
            respond().withStatusCode(400)
                .withContent('{"code":1035,"message":"Invalid MFA code"}')
                .skipDefaultBehaviour();
        }
    }
}
