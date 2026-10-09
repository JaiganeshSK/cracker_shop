const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Starting full-stack production build...');

// 1. Install client dependencies
console.log('📥 Installing client dependencies...');
execSync('npm install', { cwd: path.join(__dirname, '../client'), stdio: 'inherit' });

// 2. Validate client codebase for missing imports / undefined JSX components
console.log('🔍 Validating client JSX components & imports...');
execSync('node scripts/verify-code.cjs', { cwd: path.join(__dirname, '../client'), stdio: 'inherit' });

// 3. Build Vite React client
console.log('⚡ Building Vite React bundle...');
execSync('npm run build', { cwd: path.join(__dirname, '../client'), stdio: 'inherit' });

// 3. Copy client/dist to root dist
const clientDist = path.join(__dirname, '../client/dist');
const rootDist = path.join(__dirname, '../dist');

if (fs.existsSync(clientDist)) {
  fs.cpSync(clientDist, rootDist, { recursive: true });
  console.log('✅ Copied client/dist to ./dist successfully!');
} else {
  console.error('❌ Error: client/dist not found!');
  process.exit(1);
}

// 4. Copy server/uploads to dist/uploads for Edge CDN static file serving
const serverUploads = path.join(__dirname, '../server/uploads');
const rootUploads = path.join(rootDist, 'uploads');

if (fs.existsSync(serverUploads)) {
  fs.cpSync(serverUploads, rootUploads, { recursive: true });
  console.log('✅ Copied server/uploads to ./dist/uploads for Global Edge CDN serving!');
}

console.log('🎉 Production build complete!');