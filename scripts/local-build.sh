#!/bin/bash

# Run in non-interactive mode
echo "Running local build with non-interactive pnpm install..."
pnpm install -y

echo "Building project..."
pnpm build

echo "Local build completed!" 