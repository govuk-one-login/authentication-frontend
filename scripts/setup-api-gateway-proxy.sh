#!/bin/bash

# Setup nginx-based reverse proxy for Frontend API Gateway

set -e

LOCAL_PROXY_PORT="${LOCAL_PROXY_PORT:-8888}"

echo "Starting nginx-based Frontend API proxy..."
echo ""
echo "Frontend App → localhost:8888 → Session Manager → nginx → VPC Endpoint → API"
echo ""

# Check prerequisites
if ! command -v aws &> /dev/null; then
    echo "AWS CLI not found"
    exit 1
fi

if ! command -v session-manager-plugin &> /dev/null; then
    echo "Session Manager plugin not found"
    exit 1
fi

# setup AWS credentials
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export AWS_PROFILE="di-authentication-development-admin"
source "${DIR}/export_aws_creds.sh"


echo "Finding bastion host instance"
BASTION_INSTANCE_ID=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=auth-bastion-host-SSM-Bastion" "Name=instance-state-name,Values=running" \
    --query 'Reservations[0].Instances[0].InstanceId' \
    --output text 2>/dev/null)

if [ "$BASTION_INSTANCE_ID" = "None" ] || [ -z "$BASTION_INSTANCE_ID" ]; then
    echo "   No running bastion instance found with name 'auth-bastion-host-SSM-Bastion'. Please check:"
    echo "   1. Bastion host is running"
    echo "   2. Instance has correct Name tag: auth-bastion-host-SSM-Bastion"
    echo "   3. AWS credentials are configured correctly"
    exit 1
fi

echo "Found bastion instance: $BASTION_INSTANCE_ID"
echo "Starting HTTP proxy tunnel..."

# Kill existing proxy if running
pkill -f "localPortNumber.*$LOCAL_PROXY_PORT" || true

# Start HTTP proxy tunnel through bastion
aws ssm start-session \
    --target "$BASTION_INSTANCE_ID" \
    --document-name AWS-StartPortForwardingSession \
    --parameters "{\"portNumber\":[\"80\"],\"localPortNumber\":[\"$LOCAL_PROXY_PORT\"]}" \
    > "/tmp/proxy-tunnel.log" 2>&1 &

TUNNEL_PID=$!
echo "Proxy tunnel PID: $TUNNEL_PID"

# Wait and verify tunnel is established
echo "Waiting for tunnel to establish..."
for i in {1..30}; do
    if lsof -i :$LOCAL_PROXY_PORT >/dev/null 2>&1; then
        echo "Nginx reverse proxy ready at localhost:$LOCAL_PROXY_PORT"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Proxy tunnel failed to establish after 30 seconds"
        echo "Check logs: tail /tmp/proxy-tunnel.log"
        exit 1
    fi
    sleep 1
done

echo ""
echo "Nginx reverse proxy is ready!"
echo "To stop: pkill -f 'session-manager-plugin'"
echo ""
echo "Testing proxy connectivity..."

# Load environment variables for testing
set -o allexport
source .env
set +o allexport

echo "Target: $FRONTEND_API_BASE_URL"
echo ""

# Test connectivity
echo "Testing Nginx reverse proxy connectivity"
connectivity_test=$(curl -s --connect-timeout 5 --max-time 10 "$FRONTEND_API_BASE_URL" 2>&1 || echo "CURL_ERROR: $?")

if echo "$connectivity_test" | grep -q "CURL_ERROR"; then
    if echo "$connectivity_test" | grep -q "Empty reply from server"; then
        echo "Empty reply from server (nginx issue)"
        echo "This means the tunnel is working but nginx is not responding"
    elif echo "$connectivity_test" | grep -q "Connection refused"; then
        echo "Connection refused (tunnel not running)"
    else
        echo "connectivity failed: $connectivity_test"
    fi
    exit 1
else
    echo "connectivity successful"
fi

# Test with API key
echo "🔍 Testing API endpoint with authentication..."
API_KEY="${FONTTEND_API_KEY}"
if [ -z "$API_KEY" ]; then
    echo "No FONTTEND_API_KEY found in .env - skipping authenticated test"
else
    response=$(curl -s -w "%{http_code}" -o /dev/null \
        -H "X-API-Key: $API_KEY" \
        -H "Accept: application/json" \
        --connect-timeout 5 --max-time 10 \
        "$FRONTEND_API_BASE_URL/healthcheck" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        echo "API endpoint responded successfully (200)"
    elif [ "$response" = "404" ]; then
        echo "API endpoint returned 404 (endpoint may not exist, but proxy is working)"
    elif [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo "API endpoint returned $response (auth issue, but proxy is working)"
    elif [ "$response" = "000" ]; then
        echo "API endpoint connection failed"
        exit 1
    else
        echo "API endpoint returned $response (unexpected, but proxy may be working)"
    fi
fi

echo ""
echo "Proxy test completed!"
