#!/usr/bin/env python
import json
import logging
import os
import re
import shutil
import sys
from datetime import datetime
from functools import cache, cached_property
from io import BytesIO
from pathlib import Path
from typing import Iterable, TypedDict

import boto3
import click
from botocore import exceptions as boto3_exceptions
from dotenv import dotenv_values

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger("build-env-file")


class EnvFileVariable(TypedDict):
    value: str
    comment: str | None


class EnvFileSection(TypedDict):
    header: str | None
    variables: dict[str, EnvFileVariable | str | int]


DEFAULT_USER_VARIABLES: list[EnvFileSection] = [
    {
        "header": "Miscellaneous variables",
        "variables": {
            "ENVIRONMENT": {"value": "development", "comment": "Environment"},
            "SERVICE_DOMAIN": {
                "value": "localhost",
                "comment": "Domain where app is running",
            },
        },
    },
    {
        "header": "Local Express session configuration",
        "variables": {
            "SESSION_EXPIRY": {
                "value": 3600000,
                "comment": "Express session expiry time in milliseconds",
            },
            "SESSION_SECRET": {"value": 123456, "comment": "Express session secret"},
        },
    },
    {
        # pylint: disable=line-too-long
        "header": "SmartAgent configuration for Support form submission - Ask for values",
        "variables": {
            "SMARTAGENT_API_KEY": {
                "value": "asdf",
                "comment": "API key for Smartagent",
            },
            "SMARTAGENT_API_URL": {
                "value": "asdf",
                "comment": "API URL for Smartagent",
            },
            "SMARTAGENT_WEBFORM_ID": {
                "value": "asdf",
                "comment": "Webform ID for Smartagent",
            },
        },
    },
    {
        "header": "Local stub client options",
        "variables": {
            "VTR": {
                "value": '["Cl","Cl.m"]',
                "comment": "VTR for the stub client authorization request",
            },
        },
    },
    {
        "header": "Feature switches",
        "variables": {
            "SUPPORT_MFA_OPTIONS": 1,
            "SUPPORT_AUTHORIZE_CONTROLLER": 1,
            "SUPPORT_ACCOUNT_INTERVENTIONS": 1,
            "SUPPORT_REAUTHENTICATION": 1,
            "NO_PHOTO_ID_CONTACT_FORMS": 1,
            "LANGUAGE_TOGGLE_ENABLED": 1,
            "SUPPORT_NEW_IPV_SPINNER": 0,
            "SUPPORT_HTTP_KEEP_ALIVE": 0,
            "PRIVACY_NOTICE_REDIRECT_ENABLED": 1,
            "USE_REBRAND": 1,
            "SUPPORT_PASSKEY_USAGE": 1,
            "SUPPORT_PASSKEY_REGISTRATION": 1,
            "ENABLE_DWP_KBV_CONTACT_FORM_CHANGES": 1,
        },
    },
    {
        "header": "Redis configuration",
        "variables": {
            "REDIS_HOST": {"value": "localhost", "comment": "Redis host"},
            "REDIS_PORT": {"value": 6379, "comment": "Redis port"},
        },
    },
    {
        "header": "Docker ports",
        "variables": {
            "DOCKER_STUB_NO_MFA_PORT": {
                "value": 5000,
                "comment": "Listen port for no-mfa stub",
            },
            "DOCKER_STUB_DEFAULT_PORT": {
                "value": 2000,
                "comment": "Listen port for default stub",
            },
            "DOCKER_FRONTEND_PORT": {
                "value": 3000,
                "comment": "Listen port for frontend",
            },
            "DOCKER_FRONTEND_NODEMON_PORT": {
                "value": 9230,
                "comment": "Listen port for frontend nodemon",
            },
        },
    },
    {
        "header": "Analytics",
        "variables": {
            "GA4_ENABLED": {
                "value": "true",
                "comment": "GA4 Enablement",
            },
            "GOOGLE_ANALYTICS_4_GTM_CONTAINER_ID": {
                "value": "GTM-KD86CMZ",
                "comment": "Listen port for frontend nodemon",
            },
            "ANALYTICS_COOKIE_DOMAIN": {
                "value": "localhost",
                "comment": "Analytics cookie domain where cookie is set",
            },
            "VITAL_SIGNS_INTERVAL_SECONDS": {
                "value": "360",
                "comment": "How often the vital signs statistics will be written to logs",
            },
        },
    },
]

DEFAULT_USER_VARIABLE_LOOKUP = {
    name: i
    for i, section in enumerate(DEFAULT_USER_VARIABLES)
    for name in section["variables"]
}


@cache
def cached_get_json_from_s3(s3_client, bucket, path) -> dict:
    f = BytesIO()
    s3_client.download_fileobj(bucket, path, f)
    return json.loads(f.getvalue())


class FatalError(Exception):
    pass


class StateGetter:
    boto_client: boto3.Session
    s3_client: boto3.client
    dynamodb_client: boto3.client

    def __init__(self, deployment_name: str, state_bucket: str, aws_profile_name: str):
        self.deployment_name = deployment_name
        self.state_bucket = state_bucket
        try:
            self.boto_client = boto3.Session(profile_name=aws_profile_name)
            self._validate_aws_credentials()
            self.s3_client = self.boto_client.client("s3")
            self.dynamodb_client = self.boto_client.client("dynamodb")
        except (
            boto3_exceptions.TokenRetrievalError,
            boto3_exceptions.SSOTokenLoadError,
        ) as e:
            logger.fatal(
                "AWS auth error: Your SSO session has expired. Please run `aws sso "
                "login --profile %s` to refresh your session.",
                aws_profile_name,
            )
            raise FatalError from e
        except boto3_exceptions.ProfileNotFound as e:
            logger.fatal(
                "AWS auth error: SSO Profile %s could not be found. Ensure you've set "
                "up your AWS profiles correctly, as-per "
                "https://govukverify.atlassian.net/l/cp/fcp74bCB (How to deploy to "
                "sandpit / authdev# environments). If you have done this and are "
                "still seeing this error, you probably don't have access to this AWS "
                "account. Please contact the team for help.",
                aws_profile_name,
            )
            raise FatalError from e
        except boto3_exceptions.BotoCoreError as e:
            logger.exception(
                "Unexpected AWS error. This could be a VPN problem. maybe. Are you "
                "connected to the VPN?",
            )
            raise FatalError from e
        except Exception as e:  # pylint: disable=broad-except
            logger.exception("Unexpected error")
            raise FatalError from e
        try:
            if not self._check_environment_exists():
                logger.fatal(
                    "Environment %s does not exist. Please check you have the correct "
                    "name",
                    deployment_name,
                )
                raise FatalError("Environment does not exist")
        except PermissionError as e:
            logger.fatal(
                "You do not have permission to access S3 on this environment. This "
                "is most likely because you are not connected to the VPN."
            )
            raise FatalError from e
        except LookupError as e:
            logger.exception(
                "Unexpected Error while checking if environment exists. This could "
                "be a VPN problem. Use the stack trace to diagnose."
            )
            raise FatalError from e

    def _check_environment_exists(self):
        try:
            self._api_remote_state
        except boto3_exceptions.ClientError as e:
            if e.response["Error"]["Code"] == "404":
                return False
            if e.response["Error"]["Code"] == "403":
                raise PermissionError from e
            raise LookupError("Error checking if environment exists") from e
        return True

    def _validate_aws_credentials(self):
        self.boto_client.client("sts").get_caller_identity()

    def get_stub_hostname_clientid_from_dynamodb(self):
        hostname_regex = re.compile(r"^https://(rp-\w+\.\w+\.stubs\.account\.gov\.uk)")
        paginator = self.dynamodb_client.get_paginator("scan")
        iterator = paginator.paginate(
            TableName=f"{self.deployment_name}-client-registry",
            Select="SPECIFIC_ATTRIBUTES",
            ProjectionExpression="ClientID, SectorIdentifierUri",
        )
        for page in iterator:
            for item in page["Items"]:
                if "SectorIdentifierUri" in item:
                    search = hostname_regex.search(item["SectorIdentifierUri"]["S"])
                    if search:
                        return search.group(1), item["ClientID"]["S"]
        raise ValueError("Stub hostname not found in DynamoDB")

    @cached_property
    def _api_remote_state(self):
        state_json = cached_get_json_from_s3(
            self.s3_client,
            self.state_bucket,
            f"frontend-{self.deployment_name}-terraform.tfstate",
        )
        resources = state_json["resources"]
        return next(
            resource
            for resource in resources
            if resource["mode"] == "data"
            and resource["type"] == "terraform_remote_state"
            and resource["name"] == "api"
        )

    @cached_property
    def _ecs_task_environment(self):
        state_json = cached_get_json_from_s3(
            self.s3_client,
            self.state_bucket,
            f"frontend-{self.deployment_name}-terraform.tfstate",
        )
        resources = state_json["resources"]
        definitions = next(
            resource
            for resource in resources
            if resource["mode"] == "managed"
            and resource["type"] == "aws_ecs_task_definition"
            and resource["name"] == "frontend_task_definition"
        )["instances"][0]["attributes"]["container_definitions"]
        definitions = json.loads(definitions)
        return next(
            definition["environment"]
            for definition in definitions
            if definition["name"] == "frontend-application"
        )

    def get_api_remote_state_value(self, key: str):
        api_remote_state = self._api_remote_state
        try:
            return api_remote_state["instances"][0]["attributes"]["outputs"]["value"][
                key
            ]
        except KeyError as e:
            raise KeyError(f"Key {key} not found in api remote state") from e

    def get_ecs_task_environment_value(self, key: str):
        ecs_task_environment = self._ecs_task_environment
        try:
            return next(
                env["value"] for env in ecs_task_environment if env["name"] == key
            )
        except KeyError as e:
            raise KeyError(f"Key {key} not found in ecs task environment") from e


def get_static_variables(
    deployment_name: str,
    aws_profile_name: str,
    state_getter: StateGetter,
) -> list[EnvFileSection]:
    try:
        stub_hostname, client_id = (
            state_getter.get_stub_hostname_clientid_from_dynamodb()
        )
    except ValueError as e:
        logger.error("Error getting stub hostname from DynamoDB: %s", e)
        raise FatalError from e
    return [
        {
            "variables": {
                "DEPLOYMENT_NAME": deployment_name,
                "AWS_PROFILE": aws_profile_name,
                "API_BASE_URL": state_getter.get_api_remote_state_value("base_url"),
                "FRONTEND_API_BASE_URL": state_getter.get_api_remote_state_value(
                    "frontend_api_base_url"
                ),
            },
        },
        {
            "variables": {
                "STUB_HOSTNAME": stub_hostname,
                "API_KEY": state_getter.get_ecs_task_environment_value("API_KEY"),
                "TEST_CLIENT_ID": client_id,
                "URL_FOR_SUPPORT_LINKS": state_getter.get_ecs_task_environment_value(
                    "URL_FOR_SUPPORT_LINKS"
                ),
                "ORCH_TO_AUTH_CLIENT_ID": state_getter.get_ecs_task_environment_value(
                    "ORCH_TO_AUTH_CLIENT_ID"
                ),
                "ENCRYPTION_KEY_ID": state_getter.get_ecs_task_environment_value(
                    "ENCRYPTION_KEY_ID"
                ),
                "ORCH_TO_AUTH_AUDIENCE": get_signin_url(deployment_name),
                "ORCH_TO_AUTH_SIGNING_KEY": state_getter.get_ecs_task_environment_value(
                    "ORCH_TO_AUTH_SIGNING_KEY"
                ),
                "ORCH_STUB_TO_AUTH_AUDIENCE": get_signin_url(deployment_name)
                if "dev" in deployment_name
                else "",
                "ORCH_STUB_TO_AUTH_CLIENT_ID": state_getter.get_ecs_task_environment_value(
                    "ORCH_STUB_TO_AUTH_CLIENT_ID"
                ),
                "ORCH_STUB_TO_AUTH_SIGNING_KEY": state_getter.get_ecs_task_environment_value(
                    "ORCH_STUB_TO_AUTH_SIGNING_KEY"
                ),
            },
        },
    ]


def get_signin_url(deployment_name: str) -> str:
    if deployment_name.startswith("authdev"):
        return "https://signin.{}.dev.account.gov.uk/".format(deployment_name)
    else:
        return "https://signin.{}.account.gov.uk/".format(deployment_name)


def get_user_variables(
    dotenv_file: Path, static_variables: list[EnvFileSection]
) -> list[EnvFileSection]:
    if not dotenv_file.exists() or not dotenv_file.is_file():
        return DEFAULT_USER_VARIABLES

    known_static_variable_names = [
        var for section in static_variables for var in section["variables"]
    ]

    vars_from_file = dotenv_values(dotenv_file)
    user_variables = DEFAULT_USER_VARIABLES.copy()
    unrecognised_vars = {}
    for k, v in vars_from_file.items():
        if k in known_static_variable_names:
            continue
        if k in DEFAULT_USER_VARIABLE_LOOKUP:
            section_index = DEFAULT_USER_VARIABLE_LOOKUP[k]
            user_variables[section_index]["variables"][k] = v
            continue
        if k in unrecognised_vars:
            logger.warning(
                "Duplicate variable found: `%s=%s`. Not adding to env file.", k, v
            )
            continue

        unrecognised_vars[k] = v

        if len(unrecognised_vars) > 0:
            return user_variables + [
                {
                    "header": "Unrecognised variables from import",
                    "variables": unrecognised_vars,
                }
            ]

    return user_variables


def format_value(value: str | int) -> str:
    if isinstance(value, int):
        return format_value(str(value))
    if "\n" in value:
        value = value.replace('"', '\\"')
        value = f'"{value}"'
    return value


def build_lines_from_section(sections: list[EnvFileSection]) -> Iterable[str]:
    for section in sections:
        if section.get("header"):
            yield f"# {section['header']}"
        for var_name, var in section["variables"].items():
            if isinstance(var, dict):
                yield f"# {var['comment']}"
                var = var["value"]
            yield f"{var_name}={format_value(var)}"
        yield ""


def build_env_file_lines(
    deployment_name: str,
    static_sections: list[EnvFileSection],
    user_sections: list[EnvFileSection],
) -> Iterable[str]:
    # pylint: disable=line-too-long
    yield from [
        f"# This file was generated with `build-env.sh {deployment_name}` at {datetime.now().isoformat()}.\n",
        "# You may update variables between this line and the 'DO NOT EDIT BELOW THIS LINE' marker.\n",
    ]

    yield from build_lines_from_section(user_sections)
    yield "# DO NOT EDIT BELOW THIS LINE"  # Mark the end of user-editable variables
    yield f"# The following variables should be updated by rerunning `build-env.sh {deployment_name}`"
    yield "# Any manual changes made below this line will be lost.\n"
    yield from build_lines_from_section(static_sections)


def main(
    deployment_name: str,
    aws_profile_name: str,
    dotenv_file: Path,
    state_getter: StateGetter,
):
    start_time = datetime.now()
    static_variables = get_static_variables(
        deployment_name, aws_profile_name, state_getter
    )
    user_variables = get_user_variables(dotenv_file, static_variables)

    env_file_lines = build_env_file_lines(
        deployment_name, static_variables, user_variables
    )

    # Create a backup of the existing .env file
    try:
        dotenv_file_backup = dotenv_file.with_suffix(dotenv_file.suffix + ".bak")
        logger.info("Backing up %s to %s", dotenv_file, dotenv_file_backup)
        shutil.copy2(dotenv_file, dotenv_file_backup)
    except FileNotFoundError:
        logger.warning("No existing .env file found to back up.")
    # pylint: disable=broad-except
    except Exception as e:
        logger.error("Error backing up %s: %s", dotenv_file, e)
        raise FatalError from e

    try:
        dotenv_file.write_text("\n".join(env_file_lines))
    except OSError as e:
        logger.error("Error writing to %s: %s", dotenv_file, e)
        raise FatalError from e

    logger.info(
        "Successfully updated %s with values from %s environment in %f seconds.",
        dotenv_file,
        deployment_name,
        (datetime.now() - start_time).total_seconds(),
    )


NAMED_ENVIRONMENTS = [
    "sandpit",
    "dev",
    "authdev1",
    "authdev2",
    "build",
    "staging",
]


@click.command()
@click.argument("deploy_env", type=click.Choice(NAMED_ENVIRONMENTS))
def base_command(deploy_env: str):
    try:
        assert os.getenv("FROM_WRAPPER", "false") == "true"
    except AssertionError:
        logger.fatal(
            "This script is intended to be run from the wrapper "
            "`scripts/build-env-file.sh`. Please use that instead."
        )
        sys.exit(1)

    if deploy_env in ["sandpit", "build"]:
        _aws_profile_name = "gds-di-development-admin"
        _state_bucket_name = "digital-identity-dev-tfstate"
    elif re.match(r"^authdev[0-9]+$", deploy_env) or deploy_env == "dev":
        _aws_profile_name = "di-auth-development-admin"
        _state_bucket_name = "di-auth-development-tfstate"
    elif deploy_env == "staging":
        _aws_profile_name = "di-auth-staging-admin"
        _state_bucket_name = "di-auth-staging-tfstate"
    else:
        logger.fatal(f"Unknown or unsupported environment: {deploy_env}")
        sys.exit(1)

    try:
        state_getter = StateGetter(deploy_env, _state_bucket_name, _aws_profile_name)
        main(deploy_env, _aws_profile_name, Path(".env"), state_getter)
    except FatalError:
        sys.exit(1)


if __name__ == "__main__":
    base_command()
