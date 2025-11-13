#!/bin/bash

# Setup HTTP proxy through bastion host for API Gateway Private APIs

set -e

# Configuration
LOCAL_PROXY_PORT="${LOCAL_PROXY_PORT:-8888}"

echo "🔧 Setting up API Gateway proxy through bastion host..."

# Check prerequisites
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found"
    exit 1
fi

if ! command -v session-manager-plugin &> /dev/null; then
    echo "❌ Session Manager plugin not found"
    exit 1
fi

# Get script directory and load AWS credentials
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export AWS_PROFILE="di-authentication-development-admin"
source "${DIR}/export_aws_creds.sh"

# Auto-discover bastion instance ID
echo "🔍 Finding bastion host instance..."
BASTION_INSTANCE_ID=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=auth-bastion-host-SSM-Bastion" "Name=instance-state-name,Values=running" \
    --query 'Reservations[0].Instances[0].InstanceId' \
    --output text 2>/dev/null)

if [ "$BASTION_INSTANCE_ID" = "None" ] || [ -z "$BASTION_INSTANCE_ID" ]; then
    echo "❌ No running bastion instance found with name 'auth-bastion-host-SSM-Bastion'. Please check:"
    echo "   1. Bastion host is running"
    echo "   2. Instance has correct Name tag: auth-bastion-host-SSM-Bastion"
    echo "   3. AWS credentials are configured correctly"
    exit 1
fi

echo "✅ Found bastion instance: $BASTION_INSTANCE_ID"

echo "🚇 Starting HTTP proxy tunnel..."

# Kill existing proxy if running
pkill -f "localPortNumber.*$LOCAL_PROXY_PORT" || true

# Start HTTP proxy tunnel through bastion
aws ssm start-session \
    --target "$BASTION_INSTANCE_ID" \
    --document-name AWS-StartPortForwardingSession \
    --parameters "{\"portNumber\":[\"3128\"],\"localPortNumber\":[\"$LOCAL_PROXY_PORT\"]}" \
    > "/tmp/proxy-tunnel.log" 2>&1 &

TUNNEL_PID=$!
echo "📝 Proxy tunnel PID: $TUNNEL_PID"

# Wait and verify tunnel is established
echo "⏳ Waiting for tunnel to establish..."
for i in {1..30}; do
    if lsof -i :$LOCAL_PROXY_PORT >/dev/null 2>&1; then
        echo "✅ HTTP proxy ready at localhost:$LOCAL_PROXY_PORT"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Proxy tunnel failed to establish after 30 seconds"
        echo "Check logs: tail /tmp/proxy-tunnel.log"
        exit 1
    fi
    sleep 1
done
echo ""
echo "🐳 Start your container with:"
echo "   docker-compose -f docker-compose.proxy.yml up"
echo ""
echo "🛑 To stop proxy:"
echo "   pkill -f 'session-manager-plugin'"
