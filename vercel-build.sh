#!/bin/bash

# Build the client
echo "Building client..."
npm run build

# Build the server
echo "Building server..."
npm run build:server

echo "Build completed successfully!" 