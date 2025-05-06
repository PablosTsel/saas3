#!/bin/bash

# Exit on error
set -e

echo "Starting Netlify build process..."

# Ensure necessary directories exist
mkdir -p .next
mkdir -p public/templates

# Install dependencies (use -y to auto-confirm prompts)
echo "Installing dependencies..."
pnpm install -y

# Build the application
echo "Building application..."
pnpm build

# List template directories for debugging
echo "Template directories:"
ls -la templates/ || echo "No templates directory at root"
ls -la public/templates/ || echo "No templates directory in public"

# Make sure templates are copied to all needed locations
echo "Copying templates to necessary locations..."

# First ensure the templates/ directory content is copied to public/templates/
if [ -d "templates" ]; then
  echo "Copying templates/ to public/templates/"
  cp -r templates/* public/templates/ || echo "Warning: Failed to copy from templates/ to public/templates/"
fi

# Then copy templates to .next directory
echo "Copying templates to .next/"
mkdir -p .next/templates
cp -r public/templates/* .next/templates/ || echo "Warning: Failed to copy templates to .next/"

# Copy to .next/static
echo "Copying templates to .next/static/"
mkdir -p .next/static/templates
cp -r public/templates/* .next/static/templates/ || echo "Warning: Failed to copy templates to .next/static/"

# Copy to .next/server
echo "Copying templates to .next/server/app/api/templates/"
mkdir -p .next/server/app/api/templates
cp -r public/templates/* .next/server/app/api/templates/ || echo "Warning: Failed to copy templates to .next/server/"

# If standalone directory exists, copy there too
if [ -d ".next/standalone" ]; then
  echo "Copying templates to .next/standalone/"
  mkdir -p .next/standalone/templates
  cp -r public/templates/* .next/standalone/templates/ || echo "Warning: Failed to copy templates to .next/standalone/"
  
  # Also to standalone/public
  echo "Copying templates to .next/standalone/public/templates/"
  mkdir -p .next/standalone/public/templates
  cp -r public/templates/* .next/standalone/public/templates/ || echo "Warning: Failed to copy templates to .next/standalone/public/"
fi

# List what's copied for debugging
echo "Copied templates:"
ls -la public/templates/ || echo "Warning: public/templates/ not found"
ls -la .next/templates/ || echo "Warning: .next/templates/ not found"

# Set appropriate permissions
echo "Setting permissions..."
chmod -R 755 .next
chmod -R 755 public

echo "Build process completed successfully!" 