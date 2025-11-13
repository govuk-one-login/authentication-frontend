#!/bin/bash

# Setup nginx-based reverse proxy for Frontend API Gateway

set -e

LOCAL_PROXY_PORT="${LOCAL_PROXY_PORT:-8888}"

echo "Starting nginx-based Frontend API proxy..."
echo ""
echo "Frontend App → localhost:8888 → Session Manager → nginx → VPC Endpoint → API"
echo ""

# Check prerequisites
if ! command -v aws &>/dev/null; then
	echo "AWS CLI not found"
	exit 1
fi

if ! command -v session-manager-plugin &>/dev/null; then
	echo "Session Manager plugin not found"
	exit 1
fi

# setup AWS credentials
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export AWS_PROFILE="di-authentication-development-admin"
# shellcheck disable=SC1091
source "${DIR}/export_aws_creds.sh"

# Interactive environment selection
echo "Select environment:"
echo "1) authdev1"
echo "2) authdev2"
echo "3) dev"
read -r -p "Enter choice (1, 2, or 3): " choice

case $choice in
1) ENVIRONMENT="authdev1" ;;
2) ENVIRONMENT="authdev2" ;;
3) ENVIRONMENT="dev" ;;
*)
	echo "Invalid choice. Please select 1, 2, or 3."
	exit 1
	;;
esac

STACK_NAME="${STACK_NAME:-auth-dev-bastion-host}"

echo "Selected environment: $ENVIRONMENT"
echo "Finding bastion host instance for ${ENVIRONMENT}"

# Get instance ID from CloudFormation stack
if [ "$ENVIRONMENT" = "authdev1" ]; then
	OUTPUT_KEY="BastionInstanceAuthdev1Id"
elif [ "$ENVIRONMENT" = "authdev2" ]; then
	OUTPUT_KEY="BastionInstanceAuthdev2Id"
else
	OUTPUT_KEY="BastionInstanceDevId"
fi

BASTION_INSTANCE_ID=$(aws cloudformation describe-stacks \
	--stack-name "$STACK_NAME" \
	--query "Stacks[0].Outputs[?OutputKey=='$OUTPUT_KEY'].OutputValue" \
	--output text 2>/dev/null)

if [ "$BASTION_INSTANCE_ID" = "None" ] || [ -z "$BASTION_INSTANCE_ID" ]; then
	echo "   No bastion instance found for $ENVIRONMENT. Please check:"
	echo "   1. Bastion stack '$STACK_NAME' exists"
	echo "   2. Instance for $ENVIRONMENT is running"
	echo "   3. AWS credentials are configured correctly"
	exit 1
fi

echo "Found bastion instance for $ENVIRONMENT: $BASTION_INSTANCE_ID"

echo "Starting HTTP proxy tunnel..."

# Kill existing proxy if running
pkill -f "localPortNumber.*$LOCAL_PROXY_PORT" || true

# Start HTTP proxy tunnel through bastion
aws ssm start-session \
	--target "$BASTION_INSTANCE_ID" \
	--document-name AWS-StartPortForwardingSession \
	--parameters "{\"portNumber\":[\"80\"],\"localPortNumber\":[\"$LOCAL_PROXY_PORT\"]}" \
	>"/tmp/proxy-tunnel.log" 2>&1 &

TUNNEL_PID=$!
echo "Proxy tunnel PID: $TUNNEL_PID"

# Wait and verify tunnel is established
echo "Waiting for tunnel to establish..."
for i in {1..30}; do
	if lsof -i :"$LOCAL_PROXY_PORT" >/dev/null 2>&1; then
		echo "Nginx reverse proxy ready at localhost:$LOCAL_PROXY_PORT"
		break
	fi
	if [ "$i" -eq 30 ]; then
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
# shellcheck disable=SC1091
source "${DIR}/../.env"
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

# Test API reachability
echo "Testing API reachability..."
if [ -n "$API_KEY" ]; then
	if curl -s -f -H "X-API-Key: $API_KEY" --connect-timeout 5 --max-time 10 "$FRONTEND_API_BASE_URL" >/dev/null 2>&1; then
		echo "API is reachable with authentication"
	else
		echo "API connection failed"
		exit 1
	fi
else
	echo "No API_KEY found - skipping authenticated test"
fi

echo ""
echo "Proxy test completed!"
