var body = JSON.parse(context.request.body);
var email = body.email || 'default';
var lockedOut = stores.open('lockedOutPassword').load(email);

if (lockedOut) {
    respond().withStatusCode(400)
        .withContent('{"code":1045,"message":"Account locked"}')
        .skipDefaultBehaviour();
} else {
    respond().withStatusCode(200)
        .withFile('responses/user-exists-200.json')
        .skipDefaultBehaviour();
}
