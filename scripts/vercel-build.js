const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Helper to recursively copy directories
function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

try {
  console.log('--- Vercel Build Script Starting ---');

  const srcUploads = path.join(__dirname, '../server/uploads');
  const destUploads = path.join(__dirname, '../client/public/uploads');

  console.log(`Copying upload assets from ${srcUploads} to ${destUploads}...`);
  copyFolderSync(srcUploads, destUploads);
  console.log('Upload assets copied successfully.');

  console.log('Installing client dependencies...');
  execSync('npm install --prefix client', { stdio: 'inherit' });

  console.log('Building React client...');
  execSync('npm run build --prefix client', { 
    stdio: 'inherit',
    env: { ...process.env, CI: 'false' }
  });

  console.log('--- Vercel Build Script Completed Successfully ---');
} catch (error) {
  console.error('Error during vercel-build execution:', error);
  process.exit(1);
}
