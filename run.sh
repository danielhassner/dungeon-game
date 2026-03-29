#!/bin/bash

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "node_modules not found. Installing dependencies..."
    npm install
fi

# Run the development server
echo "Starting development server..."
npm run dev
