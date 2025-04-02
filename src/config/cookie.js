export function getCSRFCookieOptions(isProdEnv) {
    return {
        httpOnly: isProdEnv,
        secure: isProdEnv,
    };
}
