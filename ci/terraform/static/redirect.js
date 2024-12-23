function handler(event) {
  return {
    statusCode: 301,
    statusDescription: 'Permanently Moved',
    headers:
        {"location": {"value": "${REDIRECT_BASE_URL}" + event.request.uri}}
  };
}
