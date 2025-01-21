# Migrate Authentication Frontend to secure pipelines

## Startup settings

The Authentication frontend is the first application to migrate to the new strategic AWS accounts, using DevPlatform secure pipelines. The backend and data stores are still running from the old AWS accounts. The old style of deployment is via the auth-deploy-pipeline using Terraform. These terraform modules are the primary sources of the secrets listed here. The secrets are manually copied verbatim to the new AWS accounts so the frontend can establish connections to the backend and data stores at startup.

The [Startup settings](https://govukverify.atlassian.net/wiki/spaces/LO/pages/4389699622/Startup+settings) confluence page explains how the authentication frontend uses each secret or parameter, which entry in the old AWS account it is copied from (if applicable), and how it was generated.

## Startup sequence

1. Bootstrap target account with the Stack Orchestration tool. Configurations and instruction can be found in the [authentication-infrastructure](https://github.com/govuk-one-login/authentication-infrastructure) GitHub repository
2. Deploy frontend. The bootstrap step 1 sets up required dependencies and the frontend pipeline stack in the target account. GitHub workflow [deploy-frontend-sp](../.github/workflows/deploy-frontend-sp.yml) packages and uploads the artifacts, which then triggers deployment via AWS CodePipeline in the target account

## How to deploy authentication-frontend to development environments

### Using GitHub Workflows

Follow to [how-to](https://govukverify.atlassian.net/wiki/spaces/LO/pages/4462215197/How+to+deploy+frontend+to+dev+environments+using+secure+pipeline) guide.
It uses the dedicated GitHub workflow [.github/workflows/deploy-frontend-sp-dev.yml](../../.github/workflows/deploy-frontend-sp-dev.yml). The workflow is manually triggered with workflow_dispatch.

### Command-line tooling

SAM deploy frontend to new authdevs via command line uses the existing [deploy-authdevs.sh](../../deploy-authdevs.sh) script. The UI hasn't changed, deployment functionality has been added for the new environments that use cloudformation template and sam deploy, instead of terraform.

Users will see two new environment options. The "-sp" authdev deployments switch to running [scripts/dev_sam_deploy.sh](../../scripts/dev_sam_deploy.sh). It builds the frontend docker image, runs `sam build` and `sam deploy` to deploy frontend. All existing usage options are supported

```shell
$ ./deploy-authdevs.sh
1) authdev1
2) authdev2
3) authdev1-sp
4) authdev2-sp
```

Example run:

- `./deploy-authdevs.sh -b -d -p` to build, deploy and prompt on deployment. `-t` option can also be used interchangeably with `-d`
- `./deploy-authdevs.sh --destroy` to delete a frontend cloudformation stack

## How to introduce feature flags

In the `Conditions` section in [template.yaml](./template.yaml), add conditions and equality checks that enable a feature flag per environment/sub-environment level.

In the `Mappings` section, EnvironmentConfiguration mapping set the feature flag status (Yes, No) per environment/sub-environment level.

AWS resources are configured with feature flags in the `Globals` or `Resources` sections. Each use-case is different, follow existing examples for guidance.

### At environment level

**Example**: whether to deploy the service down page

Setting a condition

```Yaml
Conditions:
  DeployServiceDownPage:
    Fn::Equals:
      - !FindInMap [
          EnvironmentConfiguration,
          !Ref Environment,
          DeployServiceDownPage,
          DefaultValue: "No",
        ]
      - "Yes"
```

Configure at environment level

```Yaml
Mappings:
  EnvironmentConfiguration:
    build:
      DeployServiceDownPage: "No"
    staging:
      DeployServiceDownPage: "No"
    integration:
      DeployServiceDownPage: "Yes"
    production:
      DeployServiceDownPage: "Yes"
```

### Both environments and sub-environments level

Authentication Frontend uses the [sub-environment feature](https://govukverify.atlassian.net/wiki/spaces/PLAT/pages/4469489758/Secure+pipelines+support+multiple+dev+environments+within+a+single+AWS+account) in secure pipelines for managing multiple authdev environments within dev, a single AWS account. For instance, `authdev1` is classified as `Environment: dev, SubEnvironment: authdev1` in the secure pipelines. This allows us to configure features in each authdev envs separately from the dev environment.

EnvironmentConfiguration maintains a **flat** mapping, authdev environments configuration are treated at the same level as environments, and **not nested**.

**Example**: Now to enable MFA reset

Setting a condition

```Yaml
Conditions:
  UseMfaResetWithIpv:
    Fn::Or:
      - Fn::And:
          - !Condition UseSubEnvironment
          - Fn::Equals:
              - !FindInMap [
                  EnvironmentConfiguration,
                  !Ref SubEnvironment,
                  UseMfaResetWithIpv,
                  DefaultValue: "No",
                ]
              - "Yes"
      - Fn::And:
          - !Condition NotSubEnvironment
          - Fn::Equals:
              - !FindInMap [
                  EnvironmentConfiguration,
                  !Ref Environment,
                  UseMfaResetWithIpv,
                  DefaultValue: "No",
                ]
              - "Yes"
```

Configure at environment and sub-environment level

```Yaml
Mappings:
  EnvironmentConfiguration:
    authdev1:
      UseMfaResetWithIpv: "Yes"
    authdev2:
      UseMfaResetWithIpv: "No"
    dev:
      UseMfaResetWithIpv: "No"
    build:
      UseMfaResetWithIpv: "No"
    staging:
      UseMfaResetWithIpv: "Yes"
```
