#!/bin/sh

URL=${1:-http://localhost:3000}

RESPONSE=$(curl -s "$URL")
echo "$RESPONSE" | grep -q "TV Hub"
