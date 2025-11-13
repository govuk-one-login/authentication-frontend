#!/bin/bash

# Deploy bastion host using CloudFormation

set -e

STACK_NAME="${STACK_NAME:-auth-bastion-host}"
VPC_ID="${VPC_ID:-vpc-your-vpc-id}"
SUBNET_ID="${SUBNET_ID:-subnet-your-private-subnet-id}"
INSTANCE_TYPE="${INSTANCE_TYPE:-t4g.micro}"

echo "🚀 Deploying bastion host CloudFormation stack..."

# Deploy stack
aws cloudformation deploy \
    --template-file cloudformation/bastion/bastion-host.yaml \
    --stack-name "$STACK_NAME" \
    --parameter-overrides \
        VpcId="$VPC_ID" \
        SubnetId="$SUBNET_ID" \
        InstanceType="$INSTANCE_TYPE" \
    --capabilities CAPABILITY_NAMED_IAM \
    --tags \
        Project=authentication-frontend \
        Purpose=private-api-access

echo "✅ Stack deployed successfully!"

# Get instance ID
INSTANCE_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`BastionInstanceId`].OutputValue' \
    --output text)

echo "📝 Bastion Instance ID: $INSTANCE_ID"
echo "🔧 Set environment variable:"
echo "   export BASTION_INSTANCE_ID=\"$INSTANCE_ID\""

# Wait for instance to be ready for SSM
echo "⏳ Waiting for instance to be ready for SSM..."
echo "   This may take 2-3 minutes..."

# Simple wait for instance to be running and SSM ready
aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"
sleep 60  # Additional wait for SSM agent to register

echo "✅ Bastion host is ready for tunneling!"
echo "📋 Next steps:"
echo "   1. export BASTION_INSTANCE_ID=\"$INSTANCE_ID\""
echo "   2. ./scripts/setup-private-api-tunnels.sh"
