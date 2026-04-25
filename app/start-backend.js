#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the backend directory
const backendDir = path.resolve(path.join(__dirname, '..', 'backend'));

console.log('Starting Django backend server...');
console.log(`Working directory: ${backendDir}\n`);

// Spawn the Python process with the virtual environment
const python = spawn('python', ['manage.py', 'runserver'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
  // Set environment to use the venv
  env: {
    ...process.env,
    VIRTUAL_ENV: path.join(backendDir, 'venv'),
    PATH: `${path.join(backendDir, 'venv', 'Scripts')};${process.env.PATH}`,
  },
});

python.on('error', (err) => {
  console.error('Failed to start backend server:', err);
  process.exit(1);
});

python.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
  process.exit(code);
});

// Handle signals
process.on('SIGINT', () => {
  console.log('\nShutting down backend server...');
  python.kill();
});

process.on('SIGTERM', () => {
  console.log('\nShutting down backend server...');
  python.kill();
});
