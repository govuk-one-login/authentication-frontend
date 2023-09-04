#!/usr/bin/env bash

echo "Stopping frontend services..."
docker-compose down
killall node || echo "No local running node processes stopped..."