#!/bin/bash

# Deploy bastion host using CloudFormation

set -e

STACK_NAME="${STACK_NAME:-auth-bastion-host}"
VPC_STACK_NAME="${VPC_STACK_NAME:-vpc}"
INSTANCE_TYPE="${INSTANCE_TYPE:-t4g.micro}"

# Set AWS profile and load credentials
export AWS_PROFILE="di-authentication-development-admin"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
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

# Get instance ID
INSTANCE_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`BastionInstanceId`].OutputValue' \
    --output text)

echo "Bastion Instance ID: $INSTANCE_ID"

# Wait for instance to be ready for SSM
echo "Waiting for instance to be ready for SSM ,This may take 2-3 minutes"
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"
sleep 60  # Additional wait for SSM agent to register

echo "Bastion host is ready for tunneling!"
