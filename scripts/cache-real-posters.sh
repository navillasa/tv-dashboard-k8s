#!/bin/bash

# Script to download real poster images from our API and cache them locally

cd "$(dirname "$0")/.."

echo "Creating posters directory..."
mkdir -p frontend/public/images/posters

echo "Fetching real show data and downloading poster images..."

# Download all posters based on the real API data
curl -s "https://image.tmdb.org/t/p/w500/mBcu8d6x6zB1el3MPNl7cZQEQ31.jpg" -o frontend/public/images/posters/ncis.jpg &
curl -s "https://image.tmdb.org/t/p/w500/5E1BhkCgjLBlqx557Z5yzcN0i88.jpg" -o frontend/public/images/posters/prison-break.jpg &
curl -s "https://image.tmdb.org/t/p/w500/9akij7PqZ1g6zl42DQQTtL9CTSb.jpg" -o frontend/public/images/posters/shameless.jpg &
curl -s "https://image.tmdb.org/t/p/w500/acrtAy8gmxcsEvrDP09MpMSCeDZ.jpg" -o frontend/public/images/posters/miraculous.jpg &
curl -s "https://image.tmdb.org/t/p/w500/yueXS3q8BtoWekcHOATFHicLl3e.jpg" -o frontend/public/images/posters/alien-earth.jpg &
curl -s "https://image.tmdb.org/t/p/w500/bL1mwXDnH5fCxqc4S2n40hoVyoe.jpg" -o frontend/public/images/posters/the-rookie.jpg &
curl -s "https://image.tmdb.org/t/p/w500/7jEVqXC14bhfAzSPgr896dMdDv6.jpg" -o frontend/public/images/posters/greys-anatomy.jpg &
curl -s "https://image.tmdb.org/t/p/w500/9JWQYB7FkGtg47wFO7GOrUDgYrx.jpg" -o frontend/public/images/posters/in-the-mud.jpg &

# Wait for all downloads to complete
wait

echo "Real poster images cached successfully!"
echo "Files saved to: frontend/public/images/posters/"
ls -la frontend/public/images/posters/
echo ""
echo "Total cached images: $(ls frontend/public/images/posters/*.jpg 2>/dev/null | wc -l)"
