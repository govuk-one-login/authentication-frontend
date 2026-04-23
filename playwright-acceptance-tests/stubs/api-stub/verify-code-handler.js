var body = JSON.parse(context.request.body);
var code = body.code;

if (code === '123456') {
    stores.open('authenticated').save('default', true);
    respond().withStatusCode(204).withEmpty().skipDefaultBehaviour();
} else {
    var store = stores.open('verifyCodeAttempts');
    var count = Number(store.load('default')) || 0;
    count++;
    store.save('default', count);

    if (count >= 6) {
        stores.open('lockedOutMfa').save('test@example.com', 'code');
        respond().withStatusCode(400)
            .withContent('{"code":1034,"message":"Entered invalid verify phone number code max times"}')
            .skipDefaultBehaviour();
    } else {
        respond().withStatusCode(400)
            .withContent('{"code":1035,"message":"Invalid MFA code"}')
            .skipDefaultBehaviour();
    }
}
