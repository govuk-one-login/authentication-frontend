#!/bin/bash

# Setup the nginx-based reverse proxy then start Frontend

echo "Running setup-api-gateway-proxy.sh"

.scripts/setup-api-gateway-proxy.sh

echo "Running start-frontend-with-proxy.sh"

./start-frontend-with-proxy.sh