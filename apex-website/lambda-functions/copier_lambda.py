import boto3
import zipfile
import io
import json
import urllib.request
import logging
from botocore.config import Config
from botocore.exceptions import ClientError

MIME_TYPES = {
    ".css": "text/css",
    ".js": "application/javascript",
    ".map": "application/json",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".png": "image/png",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".json": "application/json",
    ".txt": "text/plain",
    ".html": "text/html",
}

logger = logging.getLogger()
logger.setLevel(logging.INFO)

SUCCESS = "SUCCESS"
FAILED = "FAILED"

s3 = boto3.client(
    "s3",
    config=Config(connect_timeout=10, read_timeout=60, retries={"max_attempts": 2}),
)


def send(event, context, status, data):
    body = json.dumps(
        {
            "Status": status,
            "Reason": f"See CloudWatch Log Stream: {context.log_stream_name}",
            "PhysicalResourceId": event.get(
                "PhysicalResourceId", context.log_stream_name
            ),
            "StackId": event["StackId"],
            "RequestId": event["RequestId"],
            "LogicalResourceId": event["LogicalResourceId"],
            "Data": data,
        }
    ).encode("utf-8")
    logger.info("Sending %s response to CloudFormation: %s", status, data)
    req = urllib.request.Request(
        url=event["ResponseURL"],
        data=body,
        method="PUT",
        headers={
            "Content-Type": "application/json",
            "Content-Length": str(len(body)),
        },
    )
    urllib.request.urlopen(req, timeout=30)
    logger.info("Response sent successfully")


def handler(event, context):
    logger.info("Event: %s", json.dumps(event))
    if event["RequestType"] == "Delete":
        logger.info("Delete request — sending SUCCESS")
        return send(event, context, SUCCESS, {})

    props = event["ResourceProperties"]
    src = props["SourceBucket"]
    dst = props["DestinationBucket"]
    artifact_key = props["ArtifactKey"]
    logger.info("Create/Update request — src=%s dst=%s key=%s", src, dst, artifact_key)

    try:
        try:
            zip_obj = s3.get_object(Bucket=src, Key=artifact_key)
            logger.info("Downloaded artifact from s3://%s/%s", src, artifact_key)
        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            if error_code == "NoSuchKey":
                return send(
                    event,
                    context,
                    FAILED,
                    {"Error": f"Artifact not found: s3://{src}/{artifact_key}"},
                )
            elif error_code == "NoSuchBucket":
                return send(
                    event,
                    context,
                    FAILED,
                    {"Error": f"Source bucket does not exist: {src}"},
                )
            raise

        zip_bytes = io.BytesIO(zip_obj["Body"].read())
        try:
            with zipfile.ZipFile(zip_bytes) as zf:
                if zf.testzip() is not None:
                    return send(
                        event,
                        context,
                        FAILED,
                        {"Error": f"Corrupt zip file: s3://{src}/{artifact_key}"},
                    )
                entries = [e for e in zf.namelist() if not e.endswith("/")]
                logger.info("Extracting %d files to s3://%s", len(entries), dst)
                for entry in entries:
                    extra_args = {}
                    ext = "." + entry.rsplit(".", 1)[-1] if "." in entry else ""
                    if entry.startswith("env-config/"):
                        extra_args["ServerSideEncryption"] = "AES256"
                        extra_args["ContentType"] = "application/json"
                    elif ext in MIME_TYPES:
                        extra_args["ContentType"] = MIME_TYPES[ext]
                    s3.put_object(
                        Bucket=dst, Key=entry, Body=zf.read(entry), **extra_args
                    )
                    logger.info("Uploaded: %s", entry)
        except zipfile.BadZipFile:
            return send(
                event,
                context,
                FAILED,
                {
                    "Error": f"Invalid zip file: s3://{src}/{artifact_key} is not a valid zip"
                },
            )

        logger.info("Copy complete")
        send(event, context, SUCCESS, {"SourceBucket": src, "DestinationBucket": dst})
    except ClientError as e:
        logger.exception("AWS ClientError")
        send(
            event,
            context,
            FAILED,
            {
                "Error": f"AWS error: {e.response['Error']['Code']} - {e.response['Error']['Message']}"
            },
        )
    except Exception as e:
        logger.exception("Unexpected error")
        send(event, context, FAILED, {"Error": str(e)})
