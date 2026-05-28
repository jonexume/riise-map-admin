#!/bin/bash
# This script builds the Docker image for the correct platform (linux/amd64)
# so it can run on AWS ECS.

echo "Building Docker image for linux/amd64..."
docker build --platform linux/amd64 -t riisemap-api-server .
echo "Build complete. New image name: riisemap-api-server:latest"