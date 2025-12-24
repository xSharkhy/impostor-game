# Deployment Guide

This guide covers deploying El Impostor with:
- **Backend**: Raspberry Pi 5 (or any Linux server)
- **Frontend**: Vercel
- **Database/Auth**: Supabase (cloud)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌─────────────────────┐           ┌─────────────────────┐
│  your-app.domain    │           │ api.your-app.domain │
│      (Vercel)       │           │    (DuckDNS)        │
│                     │           │        │            │
│   React Frontend    │◄─────────►│   Raspberry Pi      │
│   - Static files    │ WebSocket │   - nginx (SSL)     │
│   - CDN global      │  + HTTP   │   - PM2 (Node.js)   │
└─────────────────────┘           │   - Socket.io       │
                                  └─────────────────────┘
                                          │
                                          ▼
                                  ┌─────────────────────┐
                                  │      Supabase       │
                                  │  - Auth (OAuth)     │
                                  │  - Database         │
                                  └─────────────────────┘
```

---

## Prerequisites

- [ ] Domain name (managed via Vercel DNS, Cloudflare, or similar)
- [ ] Raspberry Pi with Ubuntu/Debian and SSH access
- [ ] Vercel account
- [ ] Supabase project (already configured)
- [ ] GitHub repository with the project

---

## Phase 1: Configure DuckDNS

DuckDNS provides free dynamic DNS, useful if your ISP gives you a dynamic IP.

### 1.1 Create Subdomain

1. Go to [duckdns.org](https://www.duckdns.org/)
2. Log in with Google/GitHub
3. Create a subdomain: `your-app-api` → `your-app-api.duckdns.org`
4. Save your **token**

### 1.2 Set Up Auto-Update Script

On your Raspberry Pi:

```bash
mkdir -p ~/duckdns
nano ~/duckdns/duck.sh
```

Add the following (replace with your values):

```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=your-app-api&token=YOUR_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
```

Make it executable and test:

```bash
chmod +x ~/duckdns/duck.sh
~/duckdns/duck.sh
cat ~/duckdns/duck.log  # Should show "OK"
```

### 1.3 Add Cron Job

```bash
crontab -e
```

Add this line to update every 5 minutes:

```
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

### 1.4 Configure Domain CNAME

In your domain's DNS settings (Vercel, Cloudflare, etc.), add:

| Type | Name | Value |
|------|------|-------|
| CNAME | `api` | `your-app-api.duckdns.org` |

This makes `api.yourdomain.com` point to your Pi.

---

## Phase 2: Prepare Raspberry Pi

### 2.1 Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
sudo npm install -g pnpm

# Install PM2 (process manager)
sudo npm install -g pm2

# Install nginx
sudo apt-get install -y nginx

# Install certbot for SSL
sudo apt-get install -y certbot python3-certbot-nginx
```

### 2.2 Clone and Build Project

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/impostor-game.git
cd impostor-game

# Install dependencies
pnpm install

# Build server
pnpm build:server
```

### 2.3 Configure Server Environment

```bash
nano ~/impostor-game/server/.env
```

```env
PORT=3001
CLIENT_URL=https://your-app.yourdomain.com

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key

ADMIN_EMAILS=your@email.com
```

### 2.4 Set Up PM2

Create ecosystem file:

```bash
nano ~/impostor-game/ecosystem.config.cjs
```

```javascript
module.exports = {
  apps: [{
    name: 'impostor-api',
    cwd: './server',
    script: 'dist/index.js',
    env: {
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
}
```

Start the server:

```bash
cd ~/impostor-game
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # Follow the printed instructions
```

Verify it's running:

```bash
pm2 status
pm2 logs impostor-api
```

---

## Phase 3: Configure nginx + SSL

### 3.1 Create nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/impostor-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com your-app-api.duckdns.org;

    # For certbot ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeout (24 hours)
        proxy_read_timeout 86400;
    }
}
```

### 3.2 Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/impostor-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.3 Open Router Ports

In your router's admin panel, set up port forwarding:

| External Port | Internal Port | Internal IP | Protocol |
|--------------|---------------|-------------|----------|
| 80 | 80 | Pi's local IP | TCP |
| 443 | 443 | Pi's local IP | TCP |

Find your Pi's local IP with: `hostname -I`

### 3.4 Get SSL Certificate

```bash
# Create challenge directory
sudo mkdir -p /var/www/html/.well-known/acme-challenge

# Get certificate
sudo certbot --nginx -d your-app-api.duckdns.org
```

> **Troubleshooting**: If certbot fails, see the [Troubleshooting](#troubleshooting) section.

---

## Phase 4: Deploy Frontend to Vercel

### 4.1 Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`

### 4.2 Environment Variables

In Vercel project settings, add:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your anon key |
| `VITE_SOCKET_URL` | `https://your-app-api.duckdns.org` |

### 4.3 Configure Custom Domain

In Vercel > Project > Settings > Domains:

1. Add `your-app.yourdomain.com`
2. Follow DNS configuration instructions

---

## Phase 5: Configure Supabase Auth

### 5.1 Update Redirect URLs

In Supabase Dashboard > Authentication > URL Configuration:

**Site URL**:
```
https://your-app.yourdomain.com
```

**Redirect URLs** (add all):
```
https://your-app.yourdomain.com/**
http://localhost:5173/**
```

### 5.2 Update OAuth Providers

**Google** ([console.cloud.google.com](https://console.cloud.google.com/apis/credentials)):
- Add `https://your-app.yourdomain.com` to Authorized JavaScript origins
- Verify callback URL: `https://your-project.supabase.co/auth/v1/callback`

**GitHub** ([github.com/settings/developers](https://github.com/settings/developers)):
- Update Homepage URL: `https://your-app.yourdomain.com`
- Verify callback URL: `https://your-project.supabase.co/auth/v1/callback`

---

## Phase 6: Auto-Deploy Script

Create a deploy script on your Pi:

```bash
nano ~/impostor-game/deploy.sh
```

```bash
#!/bin/bash
cd ~/impostor-game
echo "Pulling latest changes..."
git pull origin main
echo "Installing dependencies..."
pnpm install
echo "Building server..."
pnpm build:server
echo "Restarting PM2..."
pm2 restart impostor-api --update-env
echo "Deploy completed: $(date)"
```

```bash
chmod +x ~/impostor-game/deploy.sh
```

To deploy updates:
```bash
~/impostor-game/deploy.sh
```

---

## Checklist

- [ ] DuckDNS subdomain created and updating
- [ ] CNAME record pointing to DuckDNS
- [ ] Node.js 20 installed on Pi
- [ ] PM2 running `impostor-api`
- [ ] nginx configured with WebSocket support
- [ ] SSL certificate from certbot
- [ ] Ports 80/443 forwarded in router
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured (Vercel + Pi)
- [ ] Supabase redirect URLs updated
- [ ] OAuth providers updated (Google/GitHub)
- [ ] Full test: login → create room → play game

---

## Troubleshooting

### Certbot fails with 404

The ACME challenge can't reach your server. Check:

1. **Port 80 is open**: Test from mobile data (not your WiFi)
2. **nginx is running**: `sudo systemctl status nginx`
3. **Correct server_name**: `cat /etc/nginx/sites-available/impostor-api`
4. **No proxy conflicts**: If using k3s/Traefik, they might be capturing port 80

### Certbot fails with DNS error

```
DNS problem: SERVFAIL looking up A for domain
```

1. Check DNS propagation: [dnschecker.org](https://dnschecker.org)
2. Wait 5-10 minutes for propagation
3. Try with DuckDNS domain directly if your custom domain has issues

### WebSocket not connecting

1. Check PM2 is running: `pm2 status`
2. Check server logs: `pm2 logs impostor-api`
3. Verify `CLIENT_URL` in server `.env` matches your frontend domain
4. Restart PM2 with new env: `pm2 restart impostor-api --update-env`

### Traefik blocking ports (k3s users)

If you have k3s installed, Traefik might be capturing ports 80/443:

```bash
# Check what's using port 80
sudo ss -tlnp | grep ':80'

# If Traefik, disable it
kubectl scale deployment traefik -n kube-system --replicas=0
kubectl delete svc traefik -n kube-system
```

### SSL certificate renewal

Certbot auto-renews via cron. Test it:

```bash
sudo certbot renew --dry-run
```

### Check nginx logs

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## Maintenance

### Update SSL certificates

Certbot handles this automatically. To force renewal:

```bash
sudo certbot renew
```

### Update Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
pm2 restart impostor-api
```

### Monitor server

```bash
pm2 monit           # Real-time monitoring
pm2 logs            # View logs
pm2 status          # Check status
htop                # System resources
```
