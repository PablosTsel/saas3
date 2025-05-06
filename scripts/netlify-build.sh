#!/bin/bash

# Ensure directories exist
mkdir -p .next
mkdir -p public/portfolios

# Run the build
echo "Running build with pnpm..."
# Use non-interactive mode with -y flag to auto-confirm prompts
pnpm install --store=.pnpm-store --frozen-lockfile -y

# Build the application
pnpm build

# Copy templates to the public directory
echo "Copying templates to ensure they are available in the build..."
cp -R templates public/

# Ensure permissions
chmod -R 755 .next
chmod -R 755 public

echo "Build completed successfully!" 