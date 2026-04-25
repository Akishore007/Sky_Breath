#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const rootPath = path.join(__dirname, '..');
const appPath = path.join(rootPath, 'app');
const backendPath = path.join(rootPath, 'backend');

console.log('\n========================================');
console.log('🌍 SkyBreath Development Environment');
console.log('========================================\n');

// Start Frontend
console.log('🚀 Starting Frontend (Vite)...');
const frontend = spawn('cmd', ['/c', 'npm run dev:frontend'], {
  cwd: appPath,
  stdio: 'inherit',
  shell: true
});

// Start Backend
console.log('🚀 Starting Backend (Django)...');
const backend = spawn('cmd', ['/c', `venv\\Scripts\\python manage.py migrate && venv\\Scripts\\python manage.py runserver`], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true
});

// Open browser after 4 seconds
setTimeout(() => {
  console.log('\n🌐 Opening browser...');
  import('open').then(openModule => {
    openModule.default('http://localhost:8080').catch(err => {
      console.log('📍 Open http://localhost:8080 in your browser');
    });
  }).catch(err => {
    console.log('📍 Open http://localhost:8080 in your browser');
  });
}, 4000);

// Display information
console.log('\n========================================');
console.log('✅ Servers Started');
console.log('========================================');
console.log('🔗 Frontend:   http://localhost:8080');
console.log('🔗 Backend:    http://localhost:8000');
console.log('========================================\n');

// Handle termination
process.on('SIGINT', () => {
  console.log('\n\n⛔ Shutting down servers...');
  frontend.kill();
  backend.kill();
  process.exit(0);
});
