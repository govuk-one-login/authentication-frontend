#!/usr/bin/env python
import json
import logging
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Iterable, TypedDict

import click
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
                "value": '"Cl.Cm"',
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


class FatalError(Exception):
    pass


def get_signin_url(deployment_name: str) -> str:
    if deployment_name.startswith("authdev"):
        return "https://signin.{}.dev.account.gov.uk/".format(deployment_name)
    else:
        return "https://signin.{}.account.gov.uk/".format(deployment_name)


def get_api_key_from_secrets_manager(deployment_name: str, aws_profile: str) -> str:
    """Fetch API key from AWS Secrets Manager using AWS CLI."""
    secret_name = f"/{deployment_name}/frontend-api-key"

    try:
        cmd = [
            "aws",
            "secretsmanager",
            "get-secret-value",
            "--secret-id",
            secret_name,
            "--profile",
            aws_profile,
            "--output",
            "json",
        ]

        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        secret_data = json.loads(result.stdout)
        return secret_data["SecretString"]

    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to fetch API key from Secrets Manager: {e.stderr}")
        return "L1f6J7gHpv9U9J2tiMaAPjjcu8RIyeJ2gMpMTNOa"  # fallback
    except Exception as e:
        logger.error(f"Error fetching API key: {e}")
        return "L1f6J7gHpv9U9J2tiMaAPjjcu8RIyeJ2gMpMTNOa"  # fallback


def get_static_variables(deployment_name: str) -> list[EnvFileSection]:
    """Get static variables from CloudFormation template."""

    template_path = (
        Path(__file__).parent.parent / "cloudformation" / "deploy" / "template.yaml"
    )

    try:
        with open(template_path, "r") as f:
            content = f.read()

        # Parse EnvironmentConfiguration mapping manually
        env_configs = {}
        lines = content.split("\n")
        in_env_config = False
        current_env = None
        current_key = None
        current_value = []
        in_multiline = False

        for i, line in enumerate(lines):
            if "EnvironmentConfiguration:" in line:
                in_env_config = True
                continue

            if not in_env_config:
                continue

            # Stop if we hit another top-level mapping
            if (
                line
                and not line.startswith(" ")
                and line != "EnvironmentConfiguration:"
            ):
                break

            # Environment name (4 spaces indentation)
            if (
                line.startswith("    ")
                and not line.startswith("      ")
                and line.strip().endswith(":")
            ):
                if in_multiline and current_key and current_env:
                    env_configs[current_env][current_key] = "\n".join(
                        current_value
                    ).strip()
                    current_value = []
                    in_multiline = False

                current_env = line.strip().rstrip(":")
                env_configs[current_env] = {}
                continue

            # Property key-value (6 spaces indentation)
            if current_env and line.startswith("      ") and ":" in line:
                if in_multiline and current_key:
                    env_configs[current_env][current_key] = "\n".join(
                        current_value
                    ).strip()
                    current_value = []
                    in_multiline = False

                key, value = line.split(":", 1)
                key = key.strip()
                value = value.strip()

                if value == "|":
                    current_key = key
                    in_multiline = True
                    current_value = []
                else:
                    env_configs[current_env][key] = value.strip('"')

            # Multi-line value content (8 spaces indentation)
            elif in_multiline and line.startswith("        "):
                current_value.append(line[8:])

        # Handle final multiline value
        if in_multiline and current_key and current_env:
            env_configs[current_env][current_key] = "\n".join(current_value).strip()

    except FileNotFoundError:
        logger.error(f"CloudFormation template not found: {template_path}")
        raise FatalError(f"CloudFormation template not found: {template_path}")
    except Exception as e:
        logger.error(f"Error parsing CloudFormation template: {e}")
        raise FatalError(f"Error parsing CloudFormation template: {e}")

    if deployment_name not in env_configs:
        raise ValueError(
            f"Environment {deployment_name} not found in CloudFormation template"
        )

    env_data = env_configs[deployment_name]

    # Determine AWS profile based on environment
    if re.match(r"^authdev[0-9]+$", deployment_name) or deployment_name == "dev":
        aws_profile = "di-auth-development-AdministratorAccessPermission"
    else:
        aws_profile = "unknown"

    # Fetch API key from Secrets Manager
    api_key = get_api_key_from_secrets_manager(deployment_name, aws_profile)

    return [
        {
            "variables": {
                "DEPLOYMENT_NAME": deployment_name,
                "AWS_PROFILE": aws_profile,
                "API_BASE_URL": env_data.get(
                    "OrchApiBaseUrl",
                    f"https://oidc.{deployment_name}.dev.account.gov.uk"
                    if deployment_name.startswith("authdev")
                    else f"https://oidc.{deployment_name}.account.gov.uk",
                ),
                "FRONTEND_API_BASE_URL": "http://localhost:8888",
            },
        },
        {
            "variables": {
                "STUB_HOSTNAME": "rp-dev.build.stubs.account.gov.uk",
                "API_KEY": {
                    "value": api_key,
                    "comment": f"Fetched from AWS Secrets Manager: /{deployment_name}/frontend-api-key",
                },
                "TEST_CLIENT_ID": "rPEUe0hRrHqf0i0es1gYjKxE5ceGN7VK",
                "URL_FOR_SUPPORT_LINKS": "https://home.build.account.gov.uk/contact-gov-uk-one-login",
                "ORCH_TO_AUTH_CLIENT_ID": "orchestrationAuth",
                "ENCRYPTION_KEY_ID": f"alias/{deployment_name}-authentication-encryption-key-alias",
                "ORCH_TO_AUTH_AUDIENCE": get_signin_url(deployment_name),
                "ORCH_TO_AUTH_SIGNING_KEY": env_data.get(
                    "orchToAuthSigningPublicKey", ""
                ),
                "ORCH_STUB_TO_AUTH_AUDIENCE": get_signin_url(deployment_name)
                if "dev" in deployment_name
                else "",
                "ORCH_STUB_TO_AUTH_CLIENT_ID": "orchestrationAuth",
                "ORCH_STUB_TO_AUTH_SIGNING_KEY": env_data.get(
                    "orchStubToAuthSigningPublicKey", ""
                ),
            },
        },
    ]


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


def replace_env_references(content: str, deployment_name: str) -> str:
    """Replace environment-specific references in content."""
    content = re.sub(r"\bauthdev2\b", deployment_name, content)
    return content


def build_env_file_lines(
    deployment_name: str,
    static_sections: list[EnvFileSection],
    user_sections: list[EnvFileSection],
) -> Iterable[str]:
    yield from [
        f"# This file was generated with `build-env.sh {deployment_name}` at {datetime.now().isoformat()}.\n",
        "# You may update variables between this line and the 'DO NOT EDIT BELOW THIS LINE' marker.\n",
    ]

    yield from build_lines_from_section(user_sections)
    yield "# DO NOT EDIT BELOW THIS LINE"
    yield f"# The following variables should be updated by rerunning `build-env.sh {deployment_name}`"
    yield "# Any manual changes made below this line will be lost.\n"
    yield from build_lines_from_section(static_sections)


def main(deployment_name: str, dotenv_file: Path):
    start_time = datetime.now()
    static_variables = get_static_variables(deployment_name)
    user_variables = get_user_variables(dotenv_file, static_variables)

    env_file_lines = build_env_file_lines(
        deployment_name, static_variables, user_variables
    )

    env_content = "\n".join(env_file_lines)
    env_content = replace_env_references(env_content, deployment_name)

    try:
        dotenv_file_backup = dotenv_file.with_suffix(dotenv_file.suffix + ".bak")
        logger.info("Backing up %s to %s", dotenv_file, dotenv_file_backup)
        shutil.copy2(dotenv_file, dotenv_file_backup)
    except FileNotFoundError:
        logger.warning("No existing .env file found to back up.")
    except Exception as e:
        logger.error("Error backing up %s: %s", dotenv_file, e)
        raise FatalError from e

    try:
        dotenv_file.write_text(env_content)
    except OSError as e:
        logger.error("Error writing to %s: %s", dotenv_file, e)
        raise FatalError from e

    logger.info(
        "Successfully updated %s with values from %s environment in %f seconds.",
        dotenv_file,
        deployment_name,
        (datetime.now() - start_time).total_seconds(),
    )


NAMED_ENVIRONMENTS = ["dev", "authdev1", "authdev2"]


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

    try:
        main(deploy_env, Path(".env"))
    except FatalError:
        sys.exit(1)


if __name__ == "__main__":
    base_command()
