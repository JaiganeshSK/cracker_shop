# Linux VPS Production Deployment Guide
## Festive Cracker E-Commerce Platform & Admin Portal

This guide provides step-by-step instructions for deploying this full-stack application (Node.js, MongoDB, React, Sharp WebP, PM2, Nginx) on a clean **Ubuntu 22.04 / 24.04 Linux VPS**.

---

### Prerequisites
- A Linux VPS with root or sudo access.
- Domain name pointed to your VPS IP address (via A Record, e.g. `yourdomain.com`).
- Minimum VPS specs: 1 CPU Core, 1 GB RAM (2 GB recommended).

---

### Step 1: Update VPS Packages
Connect via SSH and update your system packages:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx build-essential
```

---

### Step 2: Install Node.js (LTS v20 / v22)
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v # Check Node version
npm -v  # Check npm version
```

---

### Step 3: Install MongoDB (or Use MongoDB Atlas)
If running MongoDB locally on your VPS:
```bash
sudo apt install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
sudo systemctl status mongod
```

---

### Step 4: Install PM2 Process Manager Globally
```bash
sudo npm install -g pm2
```

---

### Step 5: Upload or Clone Project to VPS
Deploy code to `/var/www/cracker_shop`:
```bash
sudo mkdir -p /var/www/cracker_shop
sudo chown -R $USER:$USER /var/www/cracker_shop
cd /var/www/cracker_shop

# Either clone repository or copy project files via SFTP / SCP:
# git clone <your-repo-url> .
```

---

### Step 6: Configure Environment Variables
Create and edit the production `.env` in `server/.env`:
```bash
nano /var/www/cracker_shop/server/.env
```
Add the following:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://127.0.0.1:27017/cracker_shop
JWT_SECRET=generate_a_long_random_secret_string_here_diwali_2026
CLIENT_URL=https://yourdomain.com
```

---

### Step 7: Install Dependencies & Build Frontend
```bash
# 1. Install server dependencies
cd /var/www/cracker_shop/server
npm install --production=false

# 2. Seed initial catalog & admin account
npm run seed

# 3. Install client dependencies & build static bundle
cd /var/www/cracker_shop/client
npm install
npm run build
```

---

### Step 8: Start Backend Server with PM2
```bash
cd /var/www/cracker_shop/server
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
# Follow the command output to enable auto-start on VPS reboots
```

Verify the app is running:
```bash
pm2 status
curl http://127.0.0.1:5000/api/health
```

---

### Step 9: Configure Nginx Reverse Proxy
Copy the provided Nginx configuration:
```bash
sudo cp /var/www/cracker_shop/deployment/nginx.conf /etc/nginx/sites-available/cracker-shop
sudo nano /etc/nginx/sites-available/cracker-shop
# Replace yourdomain.com with your actual domain name!

# Enable configuration:
sudo ln -s /etc/nginx/sites-available/cracker-shop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default # Remove default site if present

# Test and reload Nginx:
sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 10: Setup Free SSL with Let's Encrypt (Certbot)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot will configure automatic SSL certificate renewal!

---

### Step 11: Configure Firewall (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

### Maintenance & Continuous Updates
To update your website in the future with 1 command:
```bash
cd /var/www/cracker_shop/deployment
chmod +x deploy.sh
./deploy.sh
```

### Useful PM2 Commands
- View live application logs: `pm2 logs cracker-shop-server`
- Monitor CPU & Memory usage: `pm2 monit`
- Restart application: `pm2 restart cracker-shop-server`
