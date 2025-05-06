#!/bin/bash

# Ensure directories exist
mkdir -p .next
mkdir -p public/portfolios

# Ensure .npmrc file has the necessary configurations
echo "Updating .npmrc configurations for Netlify build..."
cat > .npmrc << EOF
public-hoist-pattern[]=*types*
# Allow build scripts for these dependencies
enable-pre-post-scripts=true
# Explicitly approved build scripts
auto-install-peers=true
node-linker=hoisted
# Force allow scripts for these packages that Netlify was blocking
unsafe-perm=true
allow-scripts=true
allow-scripts["@firebase/util"]=true
allow-scripts["canvas"]=true
allow-scripts["protobufjs"]=true
allow-scripts["sharp"]=true
EOF

# Run the build
echo "Running build with pnpm..."
# Use non-interactive mode with -y flag to auto-confirm prompts
# Use additional flags to bypass script approval prompts
pnpm install --store=.pnpm-store --frozen-lockfile -y --unsafe-perm

# If needed, explicitly approve the builds that were causing issues
echo "Approving build scripts for specific packages..."
echo -e "@firebase/util\ncanvas\nprotobufjs\nsharp" | pnpm approve-builds --parser=bash || true

# Build the application
echo "Building application with approved scripts..."
pnpm build

# Copy templates to all necessary directories 
echo "Copying templates to ensure they are available in the build..."

# 1. Copy to public directory
echo "Copying templates to public directory..."
cp -R templates public/

# 2. Copy to .next/static directory
echo "Copying templates to .next/static directory..."
mkdir -p .next/static
cp -R templates .next/static/

# 3. Copy to .next/server/app/api directory for API routes
echo "Copying templates to .next/server directory for API routes..."
mkdir -p .next/server/app/api
cp -R templates .next/server/app/api/

# 4. Copy to root of .next directory
echo "Copying templates to .next root directory..."
cp -R templates .next/

# 5. Also inject into standalone output directory (Netlify specific)
echo "Copying templates to standalone directory..."
if [ -d ".next/standalone" ]; then
  mkdir -p .next/standalone/templates
  cp -R templates/* .next/standalone/templates/
fi

# Ensure correct permissions
chmod -R 755 .next
chmod -R 755 public

echo "Build completed successfully!" 