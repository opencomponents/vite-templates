#!/bin/bash

# Script to publish all npm packages in current directory
# Usage: ./publish-all.sh

echo "Starting npm publish for all packages in current directory..."

# Counter for tracking
published=0
failed=0

# Loop through all directories in current location
for dir in */; do
    # Skip if not a directory or if directory is empty
    if [ ! -d "$dir" ] || [ -z "$(ls -A "$dir")" ]; then
        continue
    fi
    
    # Check if directory contains a package.json file
    if [ ! -f "$dir/package.json" ]; then
        echo "⚠️  Skipping $dir - no package.json found"
        continue
    fi
    
    echo "�� Publishing package in: $dir"
    
    # Change to directory and run npm publish
    (cd "$dir" && npm publish)
    
    # Check exit status
    if [ $? -eq 0 ]; then
        echo "✅ Successfully published package in $dir"
        ((published++))
    else
        echo "❌ Failed to publish package in $dir"
        ((failed++))
    fi
    
    echo "---"
done

echo "🎉 Publishing complete!"
echo "✅ Successfully published: $published packages"
echo "❌ Failed to publish: $failed packages"
echo "�� Total processed: $((published + failed)) packages"