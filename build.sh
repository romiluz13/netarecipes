#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building project..."
npm run build

# Create .nojekyll file to prevent GitHub Pages from ignoring files that begin with an underscore
touch dist/.nojekyll

echo "Build completed successfully!"
