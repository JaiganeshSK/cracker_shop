#!/usr/bin/env bash
# ==============================================================================
# Automated 1-Command Deploy & Update Script for Linux VPS (Ubuntu / Debian)
# Usage: ./deploy.sh
# ==============================================================================

set -e

echo "🧨 Starting Cracker Shop VPS Deployment..."

# 1. Pull latest code (if using git)
if [ -d ".git" ]; then
  echo "📥 Pulling latest git changes..."
  git pull origin main
fi

# 2. Install server dependencies
echo "📦 Installing Server packages..."
cd server
npm install --production=false

# 3. Install client dependencies & build production static bundle
echo "🎨 Building React Frontend..."
cd ../client
npm install
npm run build

# 4. Return to server and reload PM2
cd ../server
echo "🚀 Reloading Node.js processes with PM2..."
if command -v pm2 &> /dev/null; then
  pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
  pm2 save
  echo "✅ PM2 cluster reloaded with zero downtime!"
else
  echo "⚠️ PM2 not found globally. Please run: npm install -g pm2"
fi

echo "🎉 Cracker Shop Deployment Completed Successfully!"
