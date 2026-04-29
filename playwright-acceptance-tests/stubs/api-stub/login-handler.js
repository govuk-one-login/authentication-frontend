var body = JSON.parse(context.request.body);
var email = body.email || 'default';
var password = body.password;

// Check MFA lockout (second visit — correct password but MFA is locked)
var mfaLockStore = stores.open('lockedOutMfa');
var mfaLockType = mfaLockStore.load(email);
if (mfaLockType && password === 'valid-password-1') {
    var code = mfaLockType === 'resend' ? 1026 : 1027;
    var msg = mfaLockType === 'resend' ? 'MFA code requests blocked' : 'Entered invalid MFA max times';
    respond().withStatusCode(400)
        .withContent('{"code":' + code + ',"message":"' + msg + '"}')
        .skipDefaultBehaviour();
} else if (password === 'valid-password-1') {
    if (email === 'authapp@example.com') {
        respond().withStatusCode(200).withFile('responses/login-200-auth-app.json').skipDefaultBehaviour();
    } else {
        respond().withStatusCode(200).withFile('responses/login-200.json').skipDefaultBehaviour();
    }
} else {
    var store = stores.open('loginAttempts');
    var count = Number(store.load(email)) || 0;
    count++;
    store.save(email, count);
    if (count >= 6) {
        stores.open('lockedOutPassword').save(email, true);
        respond().withStatusCode(400)
            .withContent('{"code":1028,"message":"Invalid password max attempts reached"}')
            .skipDefaultBehaviour();
    } else {
        respond().withStatusCode(400)
            .withContent('{"code":1010,"message":"Invalid password"}')
            .skipDefaultBehaviour();
    }
}
