#!/bin/bash

# Demo traffic generator for TV Dashboard
# This script generates realistic API traffic to both dev and prod environments

set -e

echo "🎬 Generating demo traffic for TV Dashboard..."

# Array of popular TV shows to search for
SHOWS=(
    "breaking bad"
    "game of thrones"
    "the office"
    "stranger things"
    "friends"
    "the mandalorian"
    "house of cards"
    "narcos"
    "ozark"
    "vikings"
    "westworld"
    "better call saul"
    "the crown"
    "black mirror"
    "sherlock"
)

# Environments to test
DEV_URL="https://dev.tv-hub.navillasa.dev"
PROD_URL="https://tv-hub.navillasa.dev"

echo "📊 Testing environments:"
echo "  DEV:  $DEV_URL"
echo "  PROD: $PROD_URL"

# Function to make API calls
make_requests() {
    local base_url=$1
    local env_name=$2
    
    echo "🔄 Generating traffic for $env_name environment..."
    
    # Test health endpoint
    echo "  ✅ Testing health endpoint..."
    curl -s "$base_url/api/health" > /dev/null || echo "    ⚠️  Health check failed"
    
    # Search for TV shows
    for show in "${SHOWS[@]}"; do
        echo "  🔍 Searching for: $show"
        curl -s "$base_url/api/shows/search?query=$(echo "$show" | sed 's/ /%20/g')" > /dev/null || echo "    ⚠️  Search failed for $show"
        
        # Add a small delay to simulate realistic usage
        sleep 0.5
    done
    
    # Test some error cases (404s)
    echo "  🚫 Testing error handling..."
    curl -s "$base_url/api/nonexistent" > /dev/null || true
    curl -s "$base_url/api/shows/search?query=" > /dev/null || true
    
    echo "  ✅ $env_name traffic generation complete!"
}

# Generate traffic for both environments
make_requests "$DEV_URL" "DEV"
echo ""
make_requests "$PROD_URL" "PROD"

echo ""
echo "🎉 Demo traffic generation complete!"
echo "📊 Check your Grafana dashboard in ~30 seconds to see the metrics!"
echo ""
echo "🔗 Dashboard URL: https://monitoring.navillasa.dev"
echo "📈 You should see:"
echo "  - API request counts increasing"
echo "  - Response time metrics"
echo "  - TV show search activity"
echo "  - Both dev and prod environment data"

