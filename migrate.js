#!/usr/bin/env node

import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Migrating from Gulp to Vite...\n');

// Clean up old build artifacts
console.log('🧹 Cleaning up old build artifacts...');
if (fs.existsSync('dist')) {
  fs.removeSync('dist');
  console.log('✅ Removed old dist directory');
}

// Remove old gulpfile
if (fs.existsSync('gulpfile.js')) {
  fs.removeSync('gulpfile.js');
  console.log('✅ Removed gulpfile.js');
}

// Create a simple development script for testing
const devScript = `#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs-extra';

console.log('Starting Vite development build...');

// Build for both Firefox and Chrome
const buildFirefox = spawn('npm', ['run', 'build:firefox'], { stdio: 'inherit', shell: true });
buildFirefox.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Firefox build completed');
  } else {
    console.error('❌ Firefox build failed');
  }
});

const buildChrome = spawn('npm', ['run', 'build:chrome'], { stdio: 'inherit', shell: true });
buildChrome.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Chrome build completed');
  } else {
    console.error('❌ Chrome build failed');
  }
});
`;

fs.writeFileSync('scripts/dev-build.js', devScript);
console.log('✅ Created development build script');

console.log('\n🎉 Migration completed!');
console.log('\nNext steps:');
console.log('1. Run "npm run build:firefox" to build for Firefox');
console.log('2. Run "npm run build:chrome" to build for Chrome');
console.log('3. Run "npm run build" to build for both browsers');
console.log('4. Check the dist/ folder for your built extensions');
console.log('\nNote: Your extensions will be automatically zipped and ready for distribution!');
