# Frontend API Access via Proxy

This guide explains how to set up the nginx-based reverse proxy for accessing private API Gateway endpoints during development.

## Overview

The proxy setup creates a secure tunnel to private API Gateway endpoints:

```
Frontend App → localhost:8888 → Session Manager → nginx → VPC Endpoint → API Gateway
```

## Prerequisites

- AWS CLI configured
- Session Manager plugin: `brew install session-manager-plugin`
- Node.js and yarn installed
- Access to `di-authentication-development-admin` AWS profile

## Quick Start

### Step 1: Deploy Bastion Host

```bash
./scripts/deploy-bastion.sh
```

### Step 2: Start Proxy and Test

```bash
./scripts/setup-api-gateway-proxy.sh
```

### Step 3: Start Frontend Application

```bash
./start-frontend-with-proxy.sh
```

## Configuration

### Environment Variables (.env)

Key configuration in `.env` file:
```bash
FRONTEND_API_BASE_URL=http://localhost:8888
FONTTEND_API_KEY=L1f6J7gHpv9U9J2tiMaAPjjcu8RIyeJ2gMpMTNOa
```

## Troubleshooting

### Common Issues

**Proxy tunnel not working:**
```bash
# Check if tunnel is running
lsof -i :8888

# Restart proxy
pkill -f 'session-manager-plugin'
./scripts/setup-api-gateway-proxy.sh
```

### Diagnostic Commands

```bash
# Check proxy status
lsof -i :8888

# Test basic connectivity
curl -v http://localhost:8888

# Test with API key
curl -H "X-API-Key: YOUR_API_KEY" http://localhost:8888/healthcheck
```