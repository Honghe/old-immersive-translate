#!/usr/bin/env node

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
