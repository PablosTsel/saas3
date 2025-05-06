#!/bin/bash

# Update .npmrc to automatically approve scripts
echo "Updating .npmrc for local build..."
cat > .npmrc << EOF
public-hoist-pattern[]=*types*
# Allow build scripts for these dependencies
enable-pre-post-scripts=true
# Explicitly approved build scripts
auto-install-peers=true
node-linker=hoisted
unsafe-perm=true
allow-scripts=true
allow-scripts["@firebase/util"]=true
allow-scripts["canvas"]=true
allow-scripts["protobufjs"]=true
allow-scripts["sharp"]=true
EOF

# Run in non-interactive mode with script approvals
echo "Running local build with non-interactive pnpm install..."
pnpm install -y --unsafe-perm

# Explicitly approve scripts if needed
echo "Approving build scripts for specific packages..."
echo -e "@firebase/util\ncanvas\nprotobufjs\nsharp" | pnpm approve-builds --parser=bash || true

echo "Building project..."
pnpm build

echo "Local build completed!" 