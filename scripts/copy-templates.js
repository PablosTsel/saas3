const fs = require('fs-extra');
const path = require('path');

async function copyTemplates() {
  const sourceDir = path.join(process.cwd(), 'templates');
  const targetDir = path.join(process.cwd(), 'public', 'templates');

  try {
    // Ensure the target directory exists
    await fs.ensureDir(targetDir);

    // Copy templates directory to public
    await fs.copy(sourceDir, targetDir, {
      overwrite: true,
      errorOnExist: false,
    });

    console.log('Successfully copied templates to public directory');
  } catch (error) {
    console.error('Error copying templates:', error);
    process.exit(1);
  }
}

copyTemplates(); 