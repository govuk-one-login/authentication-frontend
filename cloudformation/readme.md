# Migrate Authentication Frontend to secure pipelines

## Dependencies

### Secrets

The following table lists secrets required at startup, and sourced from AWS Secrets Manager

| Secret name                                 | Description                                                                                                                                                    | Source           |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| /deploy/\${Environment}/basic_auth_username | Credentials used by the nginx proxy server sidecar enforcing HTTP basic authentication on every request, when the origin is not in the ipAllowList CIDR ranges | Manually created |
| /deploy/\${Environment}/basic_auth_password | Same as above                                                                                                                                                  | Manually created |

The following table lists secretStrings sourced from AWS Systems Manager Parameter Store, and required at startup

| Parameter name                             | Description                                                                                                                                                               | Source                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| \${Environment}-frontend-redis-master-host | Redis cluster for storing user session data for the frontend. Proposed change to remove these dependencies: [AUT-3374](https://govukverify.atlassian.net/browse/AUT-3374) | Manually created after the ApplicationReplicationGroup in [template.yaml](./template.yaml) exists |
| \${Environment}-frontend-redis-password    | Same as above                                                                                                                                                             | Manually created after the ApplicationAuthPass in [template.yaml](./template.yaml) exists         |
| \${Environment}-frontend-redis-port        | Same as above                                                                                                                                                             | Manually created, uses default port                                                               |

### Parameters

The following table lists configurations required at startup, and sourced from AWS Systems Manager Parameter Store

| Parameter name                                      | Description                                          | Source                         |
| --------------------------------------------------- | ---------------------------------------------------- | ------------------------------ |
| /\${Environment}/Infra/Route53/HostedZone/SignIn/Id | Route53 Public hosted zone id of signin.\* subdomain | [domains.yaml](./domains.yaml) |
| /\${Environment}/Infra/ACM/Certificate/SignIn/ARN   | signin.\* subdomain certificate issued by AWS ACM    | [domains.yaml](./domains.yaml) |

## Startup sequence

1. Bootstrap target account with the Stack Orchestration tool. Configurations and instruction can be found in the [authentication-infrastructure](https://github.com/govuk-one-login/authentication-infrastructure) GitHub repository
2. Setup domains using Cloudformation template: [domains.yaml](./domains.yaml). At the time of writing this document on 17/07/2024, it is deployed via AWS console or cli tool
3. Deploy frontend. The bootstrap step 1 sets up required dependencies and the frontend pipeline stack in the target account. GitHub workflow [deploy-frontend-sp](../.github/workflows/deploy-frontend-sp.yml) packages and uploads the artifacts, which then triggers deployment via AWS CodePipeline in the target account
