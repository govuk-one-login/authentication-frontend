import cf from "cloudfront";

const kvsHandle = cf.kvs();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handler(event) {
  let redirectBaseUrl = "";
  try {
    redirectBaseUrl = await kvsHandle.get("redirectBaseUrl");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(`KVS lookup failed: ${err}`);
  }
  return {
    statusCode: 301,
    statusDescription: "Permanently Moved",
    headers: { location: { value: redirectBaseUrl + event.request.uri } },
  };
}
