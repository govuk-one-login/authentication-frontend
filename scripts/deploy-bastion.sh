#!/bin/bash

set -e

STACK_NAME="${STACK_NAME:-auth-dev-bastion-host}"
VPC_STACK_NAME="${VPC_STACK_NAME:-vpc}"
INSTANCE_TYPE="${INSTANCE_TYPE:-t4g.micro}"

# Set AWS profile and load credentials
export AWS_PROFILE="di-authentication-development-admin"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${DIR}/export_aws_creds.sh"

echo "Deploying bastion host CloudFormation stack..."
echo "   Stack Name: $STACK_NAME"
echo "   VPC Stack: $VPC_STACK_NAME"
echo "   Instance Type: $INSTANCE_TYPE"
echo "   AWS Region: ${AWS_REGION}"
echo ""

# Deploy stack
aws cloudformation deploy \
	--template-file cloudformation/bastion/bastion-host.yaml \
	--stack-name "$STACK_NAME" \
	--parameter-overrides \
	VpcStackName="$VPC_STACK_NAME" \
	InstanceType="$INSTANCE_TYPE" \
	--capabilities CAPABILITY_NAMED_IAM \
	--tags \
	Project=authentication-frontend \
	Purpose=private-api-access

echo "Stack deployed successfully!"

# shellcheck disable=SC2016
INSTANCE_ID_AUTHDEV1=$(aws cloudformation describe-stacks \
	--stack-name "$STACK_NAME" \
	--query 'Stacks[0].Outputs[?OutputKey==`BastionInstanceAuthdev1Id`].OutputValue' \
	--output text)

# shellcheck disable=SC2016
INSTANCE_ID_AUTHDEV2=$(aws cloudformation describe-stacks \
	--stack-name "$STACK_NAME" \
	--query 'Stacks[0].Outputs[?OutputKey==`BastionInstanceAuthdev2Id`].OutputValue' \
	--output text)

# shellcheck disable=SC2016
INSTANCE_ID_DEV=$(aws cloudformation describe-stacks \
	--stack-name "$STACK_NAME" \
	--query 'Stacks[0].Outputs[?OutputKey==`BastionInstanceDevId`].OutputValue' \
	--output text)

echo "Bastion Instance IDs:"
echo "  Authdev1: $INSTANCE_ID_AUTHDEV1"
echo "  Authdev2: $INSTANCE_ID_AUTHDEV2"
echo "  Dev: $INSTANCE_ID_DEV"

echo "Waiting for instances to be ready for SSM, this may take 2-3 minutes"
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID_AUTHDEV1" "$INSTANCE_ID_AUTHDEV2" "$INSTANCE_ID_DEV"
sleep 60 # wait for SSM agent to register

echo "All three bastion hosts are ready for tunneling!"
