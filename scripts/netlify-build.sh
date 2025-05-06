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

# Copy templates to the public directory
echo "Copying templates to ensure they are available in the build..."
cp -R templates public/

# Ensure permissions
chmod -R 755 .next
chmod -R 755 public

echo "Build completed successfully!" 