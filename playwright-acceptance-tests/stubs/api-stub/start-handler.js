var isAuthenticated = stores.open('authenticated').load('default');
var body = JSON.parse(context.request.body);

if (isAuthenticated && body.authenticated) {
    respond()
        .withStatusCode(200)
        .withContent(JSON.stringify({
            sessionId: "session-123",
            user: {
                upliftRequired: true,
                identityRequired: false,
                authenticated: true,
                mfaMethodType: "SMS",
                isBlockedForReauth: false
            },
            featureFlags: {}
        }))
        .skipDefaultBehaviour();
} else if (isAuthenticated) {
    respond()
        .withStatusCode(200)
        .withContent(JSON.stringify({
            sessionId: "session-123",
            user: {
                upliftRequired: false,
                identityRequired: false,
                authenticated: true,
                mfaMethodType: "SMS",
                isBlockedForReauth: false
            },
            featureFlags: {}
        }))
        .skipDefaultBehaviour();
} else {
    respond()
        .withStatusCode(200)
        .withFile('responses/start-200.json')
        .skipDefaultBehaviour();
}
