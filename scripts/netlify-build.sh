#!/bin/bash

# Exit on error
set -e

echo "Starting Netlify build process..."

# Ensure necessary directories exist
mkdir -p .next
mkdir -p public/templates

# Install dependencies with the simplest command possible
echo "Installing dependencies..."
# Remove all flags, just use the basic command
pnpm install

# Build the application
echo "Building application..."
pnpm build

# List template directories for debugging
echo "Template directories before copying:"
if [ -d "templates" ]; then
  echo "Root templates directory exists:"
  ls -la templates/
else
  echo "WARNING: No templates directory at root level"
fi

if [ -d "public/templates" ]; then
  echo "Public templates directory exists:"
  ls -la public/templates/
else
  echo "WARNING: No templates directory in public/"
fi

# Make sure templates are copied to all needed locations
echo "Copying templates to necessary locations..."

# First, check if we have any templates to work with
TEMPLATE_SOURCE=""
if [ -d "templates" ] && [ "$(ls -A templates 2>/dev/null)" ]; then
  echo "Using templates/ as source"
  TEMPLATE_SOURCE="templates"
elif [ -d "public/templates" ] && [ "$(ls -A public/templates 2>/dev/null)" ]; then
  echo "Using public/templates/ as source"
  TEMPLATE_SOURCE="public/templates"
else
  echo "WARNING: No template source found, creating placeholder"
  # Create a placeholder template to prevent build failures
  mkdir -p public/templates/template1/css
  mkdir -p public/templates/template1/js
  
  # Create placeholder HTML file
  cat > public/templates/template1/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template 1</title>
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <h1 id="full-name">John Doe</h1>
  <h2 id="title">AI Engineer</h2>
  <p id="small-intro">I'm a skilled AI Engineer with a passion for developing innovative solutions.</p>
  <div id="about">
    <p>Hello! I'm John Doe, a dedicated AI Engineer with expertise in machine learning, deep learning, and natural language processing...</p>
  </div>
  <div id="skills-container">
    <div class="skill">Python</div>
    <div class="skill">Machine Learning</div>
    <div class="skill">TensorFlow</div>
  </div>
  <div id="projects-container">
    <div class="project">
      <div class="project-image"></div>
      <h3 class="project-name">NBA Dashboard</h3>
      <p class="project-description">Developed an Excel file containing various data and statistics from the NBA seasons...</p>
    </div>
  </div>
  <script src="js/script.js"></script>
</body>
</html>
EOF

  # Create placeholder CSS file
  cat > public/templates/template1/css/styles.css << 'EOF'
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 20px;
}
h1, h2, h3 { margin-top: 0; }
.skill {
  display: inline-block;
  padding: 5px 10px;
  margin: 5px;
  background: #f0f0f0;
  border-radius: 3px;
}
.project {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 5px;
}
.project-image {
  height: 150px;
  background: #f0f0f0;
  margin-bottom: 10px;
}
EOF

  # Create placeholder JS file
  cat > public/templates/template1/js/script.js << 'EOF'
// Basic portfolio functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log('Portfolio template loaded');
});
EOF

  TEMPLATE_SOURCE="public/templates"
fi

# Now copy from our determined source to all needed locations
if [ -n "$TEMPLATE_SOURCE" ]; then
  # Copy to public/templates if source is templates
  if [ "$TEMPLATE_SOURCE" = "templates" ]; then
    echo "Copying from templates/ to public/templates/"
    cp -r templates/* public/templates/ || { echo "ERROR: Failed to copy from templates/ to public/templates/"; exit 1; }
  fi
  
  # Copy to .next directory
  echo "Copying templates to .next/"
  mkdir -p .next/templates
  cp -r $TEMPLATE_SOURCE/* .next/templates/ || { echo "ERROR: Failed to copy templates to .next/"; exit 1; }
  
  # Copy to .next/static
  echo "Copying templates to .next/static/"
  mkdir -p .next/static/templates
  cp -r $TEMPLATE_SOURCE/* .next/static/templates/ || { echo "ERROR: Failed to copy templates to .next/static/"; exit 1; }
  
  # Copy to .next/server
  echo "Copying templates to .next/server/app/api/templates/"
  mkdir -p .next/server/app/api/templates
  cp -r $TEMPLATE_SOURCE/* .next/server/app/api/templates/ || { echo "ERROR: Failed to copy templates to .next/server/"; exit 1; }
  
  # If standalone directory exists, copy there too
  if [ -d ".next/standalone" ]; then
    echo "Copying templates to .next/standalone/"
    mkdir -p .next/standalone/templates
    cp -r $TEMPLATE_SOURCE/* .next/standalone/templates/ || { echo "ERROR: Failed to copy templates to .next/standalone/"; exit 1; }
    
    # Also to standalone/public
    echo "Copying templates to .next/standalone/public/templates/"
    mkdir -p .next/standalone/public/templates
    cp -r $TEMPLATE_SOURCE/* .next/standalone/public/templates/ || { echo "ERROR: Failed to copy templates to .next/standalone/public/"; exit 1; }
  fi
fi

# List what's copied for debugging
echo "Template directories after copying:"
if [ -d "public/templates" ]; then
  echo "public/templates/ contents:"
  ls -la public/templates/
else
  echo "WARNING: public/templates/ not found after copying"
fi

if [ -d ".next/templates" ]; then
  echo ".next/templates/ contents:"
  ls -la .next/templates/
else
  echo "WARNING: .next/templates/ not found after copying"
fi

# Set appropriate permissions
echo "Setting permissions..."
chmod -R 755 .next
chmod -R 755 public

echo "Build process completed successfully!" 