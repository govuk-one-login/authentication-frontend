export function csrfMissingHandler(err, req, res, next) {
    const CSRF_MISSING_CODE = "EBADCSRFTOKEN";
    if (err.code === CSRF_MISSING_CODE) {
        // CSRF token missing or invalid
        res.status(403).send("Forbidden: Invalid or missing CSRF token");
    }
    else {
        next(err);
    }
}
