# Apex Website — Deployment Guide

## Overview

The apex website serves the GOV.UK One Login root domain (e.g. `account.gov.uk`). It is a static site hosted in S3 and served via CloudFront. A CloudFront Function handles requests — either performing a simple redirect or rendering a bilingual static page — using values read from a **CloudFront KeyValueStore (KVS)**.

Infrastructure is defined in [`apex-cloudfront.yaml`](./apex-cloudfront.yaml) and deployed via AWS SAM through GitHub Actions.

---

## Workflows

| Workflow                            | Trigger                                                                     | Target                                                                |
| ----------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `build-deploy-apex-website.yml`     | Push to `main` (paths: `apex-website/**`, `cloudformation/apex-website/**`) | build → staging → integration → production (via devplatform pipeline) |
| `build-deploy-apex-website-dev.yml` | Manual `workflow_dispatch`                                                  | dev / authdev environments                                            |

---

## Deployment Steps (what GHA does)

### 1. Inline CloudFront function code

```bash
./scripts/inline-cloudfront-functions.sh
```

The CloudFront function code lives in `apex-website/cloudfront-functions/` as plain `.js` files. The template contains placeholders (`# __REDIRECT_FUNCTION_CODE__`, `# __APEX_FUNCTION_CODE__`). This script uses Python to replace those placeholders with the actual JS source, producing `apex-cloudfront-built.yaml`, which is then used for all subsequent steps.

### 2. Build the Copier Lambda

```bash
zip -j apex-website/lambda-functions/copier_lambda.zip apex-website/lambda-functions/copier_lambda.py
```

Packages `copier_lambda.py` into a zip. SAM picks this up via `CodeUri: ../../apex-website/lambda-functions/copier_lambda.zip` in the template.

### 3. Zip the govuk frontend artifact and inject a checksum

```bash
zip -r govukfrontend.zip govuk-frontend/ env-config/ robots.txt
```

This zip bundles:

- `govuk-frontend/` — CSS, JS, fonts, images
- `env-config/` — per-environment KVS seed data (e.g. `build-kvs-data.json`)
- `robots.txt`

A SHA-256 checksum of the zip is injected into the CloudFormation template as `ArtifactVersion`. This forces CloudFormation to detect a change and re-invoke the Copier Lambda on every deploy where the artifact content changes.

---

## The Copier Lambda

**Source:** [`apex-website/lambda-functions/copier_lambda.py`](../../apex-website/lambda-functions/copier_lambda.py)

**CloudFormation resource:** `CopierLambda` (AWS::Serverless::Function) + `ApexS3FileCopier` (AWS::CloudFormation::CustomResource)

The Copier Lambda is a CloudFormation **Custom Resource**. On every stack create or update, CloudFormation invokes it with:

| Property            | Value                                                                          |
| ------------------- | ------------------------------------------------------------------------------ |
| `SourceBucket`      | The environment's artifact S3 bucket (from `EnvironmentConfiguration` mapping) |
| `DestinationBucket` | The `ApexStaticWebsite` S3 bucket (`{env}-di-root-website`)                    |
| `ArtifactKey`       | `govukfrontend.zip`                                                            |
| `ArtifactVersion`   | SHA-256 checksum of the zip (injected by GHA)                                  |

What it does:

1. Downloads `govukfrontend.zip` from the source bucket.
2. Validates the zip is not corrupt.
3. Extracts every file and uploads it to the destination bucket, setting correct `ContentType` headers per file extension.
4. Files under `env-config/` are uploaded with `AES256` server-side encryption.
5. Sends a `SUCCESS` or `FAILED` signal back to CloudFormation via the pre-signed `ResponseURL`.

On a `Delete` event (stack teardown) it does nothing and immediately signals `SUCCESS` — it does not empty the bucket.

---

## The CloudFront KeyValueStore (KVS)

**CloudFormation resource:** `ApexUrlKeyValueStore` (AWS::CloudFront::KeyValueStore)

The KVS is seeded at stack deploy time by importing a JSON file from the destination S3 bucket:

```
s3://{env}-di-root-website/env-config/{env}-kvs-data.json
```

This file is placed there by the Copier Lambda (it is part of the `govukfrontend.zip` artifact).

### KVS data format

```json
{
  "data": [
    { "key": "redirectBaseUrl", "value": "https://home.build.account.gov.uk" },
    {
      "key": "supportUrl",
      "value": "https://signin.build.account.gov.uk/contact-us?supportType=PUBLIC"
    },
    { "key": "version", "value": "release-v5.11.0" }
  ]
}
```

The CloudFront functions read these keys at request time via `cf.kvs().get("key")`.

### KVS files per environment

| File                                   | Environment |
| -------------------------------------- | ----------- |
| `env-config/build-kvs-data.json`       | build       |
| `env-config/staging-kvs-data.json`     | staging     |
| `env-config/integration-kvs-data.json` | integration |
| `env-config/production-kvs-data.json`  | production  |
| `env-config/dev-kvs-data.json`         | dev         |
| `env-config/authdev1-kvs-data.json`    | authdev1    |
| `env-config/authdev2-kvs-data.json`    | authdev2    |
| `env-config/authdev3-kvs-data.json`    | authdev3    |

---

## Adding or Changing KVS Keys — V2 Process

> **Important:** The `AWS::CloudFront::KeyValueStore` resource only supports importing its initial data from S3 at creation time. CloudFormation cannot update the data in-place on an existing KVS. If you need to **add a new key** or **change an existing key's value** in the KVS, you must create a new V2 KVS resource and update the CloudFront function associations to point to it.

### Steps

1. **Update the KVS data files**

   Edit the relevant `env-config/{env}-kvs-data.json` files to add or change keys:

   ```json
   {
     "data": [
       {
         "key": "redirectBaseUrl",
         "value": "https://home.build.account.gov.uk"
       },
       {
         "key": "supportUrl",
         "value": "https://signin.build.account.gov.uk/contact-us?supportType=PUBLIC"
       },
       { "key": "version", "value": "release-v5.11.0" },
       { "key": "newKey", "value": "newValue" }
     ]
   }
   ```

2. **Add a V2 KVS resource in `apex-cloudfront.yaml`**

   ```yaml
   ApexUrlKeyValueStoreV2:
     Type: AWS::CloudFront::KeyValueStore
     DependsOn:
       - ApexS3FileCopier
       - ApexStaticWebsiteBucketPolicy
     Properties:
       Name: !Sub
         - "${Env}-apex-url-kvs-v2"
         - Env: !If [UseSubEnvironment, !Ref SubEnvironment, !Ref Environment]
       Comment: V2 — updated keys for CloudFront functions
       ImportSource:
         SourceType: S3
         SourceArn: !Sub
           - "arn:aws:s3:::${BucketName}/env-config/${Env}-kvs-data.json"
           - BucketName: !Ref ApexStaticWebsite
             Env: !If [UseSubEnvironment, !Ref SubEnvironment, !Ref Environment]
   ```

3. **Update the CloudFront function resources** to reference `ApexUrlKeyValueStoreV2`

   In both `RedirectFunction` and `ApexRedirectPageFunction`, change:

   ```yaml
   KeyValueStoreAssociations:
     - KeyValueStoreARN: !GetAtt ApexUrlKeyValueStoreV2.Arn
   ```

4. **Deploy** — push to `main` (or trigger the dev workflow manually). GHA will:
   - Re-zip the artifact (including the updated `env-config/` files)
   - Inject a new checksum, causing the Copier Lambda to re-run and upload the new KVS data file to S3
   - CloudFormation creates the new `ApexUrlKeyValueStoreV2` KVS, seeding it from the updated S3 file
   - CloudFront functions are updated to use the new KVS

5. **Clean up** — once the V2 KVS is confirmed working, remove the old `ApexUrlKeyValueStore` resource from the template in a follow-up PR.

> **Why not just update the existing KVS?** CloudFormation treats a name change or a new `ImportSource` on an existing `AWS::CloudFront::KeyValueStore` as a replacement, which deletes the old resource first — causing a brief outage for the CloudFront functions that depend on it. Creating a V2 resource and swapping the association is the safe zero-downtime approach.
