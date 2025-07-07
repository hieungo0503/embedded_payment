# 🚀 Caddy HTTPS Setup Guide for 3diot.vn

## Overview
This guide will help you set up Caddy web server to serve your PayPal payment system over HTTPS with automatic SSL certificates for your domain `3diot.vn`.

## 🌟 Why Caddy?
- ✅ **Automatic HTTPS** - No manual SSL certificate management
- ✅ **Auto-renewal** - Certificates renew automatically
- ✅ **Simple configuration** - One Caddyfile vs complex nginx/apache configs
- ✅ **Built-in security headers** - Production-ready security
- ✅ **HTTP/2 support** - Better performance

## 📋 Prerequisites

### 1. Domain Requirements
- ✅ Own the domain `3diot.vn`
- ✅ Domain points to your server's public IP
- ✅ Port 80 and 443 are open on your server

### 2. Server Requirements
- ✅ Linux/Windows/macOS server
- ✅ Public IP address
- ✅ Root/Administrator access

## 🛠️ Installation Guide

### Step 1: Install Caddy

#### **Ubuntu/Debian:**
```bash
# Add Caddy repository
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list

# Install Caddy
sudo apt update
sudo apt install caddy
```

#### **CentOS/RHEL/Fedora:**
```bash
# Add Caddy repository
dnf install 'dnf-command(copr)'
dnf copr enable @caddy/caddy

# Install Caddy
dnf install caddy
```

#### **Windows:**
```powershell
# Using Chocolatey
choco install caddy

# Or download from https://caddyserver.com/download
```

#### **macOS:**
```bash
# Using Homebrew
brew install caddy
```

### Step 2: DNS Configuration

Configure your domain DNS to point to your server:

```
Type: A
Name: @
Value: YOUR_SERVER_PUBLIC_IP
TTL: 300

Type: A  
Name: www
Value: YOUR_SERVER_PUBLIC_IP
TTL: 300
```

**Check DNS propagation:**
```bash
# Test DNS resolution
nslookup 3diot.vn
dig 3diot.vn A
```

### Step 3: Firewall Configuration

#### **Ubuntu/Debian (ufw):**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # For direct Node.js access (optional)
sudo ufw reload
```

#### **CentOS/RHEL (firewalld):**
```bash
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### Step 4: Project Setup

1. **Place Caddyfile in your project directory:**
```bash
cd /path/to/your/course_pay
# Caddyfile is already created in your project
ls -la Caddyfile
```

2. **Create log directory:**
```bash
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy
```

## 🚀 Running Your Application

### Method 1: Development/Testing

1. **Start your Node.js application:**
```bash
cd /path/to/course_pay
npm start
```

2. **Start Caddy (in another terminal):**
```bash
# Run Caddy with your Caddyfile
sudo caddy run --config Caddyfile

# Or run in background
sudo caddy start --config Caddyfile
```

### Method 2: Production with systemd

1. **Create Node.js service:**
```bash
sudo nano /etc/systemd/system/course-pay.service
```

Add this content:
```ini
[Unit]
Description=IoT Course Payment System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/course_pay
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

2. **Create Caddy service (if not auto-installed):**
```bash
sudo nano /etc/systemd/system/caddy.service
```

Add this content:
```ini
[Unit]
Description=Caddy HTTP/2 web server
Documentation=https://caddyserver.com/docs/
After=network.target network-online.target
Requires=network-online.target

[Service]
Type=notify
User=caddy
Group=caddy
ExecStart=/usr/bin/caddy run --environ --config /path/to/course_pay/Caddyfile
ExecReload=/usr/bin/caddy reload --config /path/to/course_pay/Caddyfile
TimeoutStopSec=5s
LimitNOFILE=1048576
LimitNPROC=1048576
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
```

3. **Start services:**
```bash
# Reload systemd
sudo systemctl daemon-reload

# Start and enable services
sudo systemctl enable course-pay
sudo systemctl start course-pay

sudo systemctl enable caddy
sudo systemctl start caddy

# Check status
sudo systemctl status course-pay
sudo systemctl status caddy
```

## 🧪 Testing Your Setup

### 1. **Test HTTP to HTTPS redirect:**
```bash
curl -I http://3diot.vn
# Should return 301/302 redirect to https://
```

### 2. **Test HTTPS:**
```bash
curl -I https://3diot.vn
# Should return 200 OK
```

### 3. **Test SSL certificate:**
```bash
openssl s_client -connect 3diot.vn:443 -servername 3diot.vn
```

### 4. **Test in browser:**
- Visit: `https://3diot.vn`
- Check for green padlock (secure connection)
- Test PayPal payment flow

## 🔧 Useful Caddy Commands

```bash
# Start Caddy
sudo caddy start --config Caddyfile

# Stop Caddy
sudo caddy stop

# Reload configuration (zero downtime)
sudo caddy reload --config Caddyfile

# Validate Caddyfile syntax
caddy validate --config Caddyfile

# Check Caddy version
caddy version

# View logs
sudo journalctl -u caddy -f
tail -f /var/log/caddy/3diot.vn.log
```

## 🛡️ Security Features Included

Your Caddyfile includes production-ready security:

- ✅ **Automatic HTTPS** with Let's Encrypt
- ✅ **HSTS headers** for browser security
- ✅ **XSS protection** headers
- ✅ **Clickjacking protection**
- ✅ **Content Security Policy** for PayPal integration
- ✅ **Gzip compression** for performance

## 🌐 PayPal Configuration Update

Update your PayPal webhook URLs to use HTTPS:

1. **PayPal Developer Console:**
   - Login to [developer.paypal.com](https://developer.paypal.com)
   - Go to your app settings
   - Update webhook URL to: `https://3diot.vn/paypal-webhook`

2. **Test PayPal integration:**
   - Ensure PayPal buttons work over HTTPS
   - Test payment flow end-to-end

## 📊 Monitoring and Logs

### **View Caddy logs:**
```bash
# System logs
sudo journalctl -u caddy -f

# Access logs
tail -f /var/log/caddy/3diot.vn.log

# Error logs
sudo caddy logs
```

### **View Node.js logs:**
```bash
sudo journalctl -u course-pay -f
```

## 🚨 Troubleshooting

### **Common Issues:**

1. **"Permission denied" on port 80/443:**
   ```bash
   # Run Caddy with sudo or give permissions
   sudo setcap cap_net_bind_service=+ep /usr/bin/caddy
   ```

2. **DNS not resolving:**
   ```bash
   # Check DNS propagation
   nslookup 3diot.vn
   # Wait for DNS to propagate (up to 48 hours)
   ```

3. **Certificate issues:**
   ```bash
   # Clear Caddy data and restart
   sudo rm -rf ~/.local/share/caddy/
   sudo systemctl restart caddy
   ```

4. **PayPal not working over HTTPS:**
   - Ensure all PayPal URLs use HTTPS
   - Check Content Security Policy headers
   - Update PayPal webhook URLs

### **Debug mode:**
```bash
# Run Caddy in debug mode
sudo caddy run --config Caddyfile --adapter caddyfile --debug
```

## 🎯 Production Checklist

Before going live:

- [ ] Domain DNS points to server IP
- [ ] Firewall allows ports 80, 443
- [ ] Caddyfile syntax is valid
- [ ] Node.js app runs on localhost:3000
- [ ] HTTPS certificate obtained successfully
- [ ] PayPal webhook URLs updated to HTTPS
- [ ] EmailJS configured for HTTPS domain
- [ ] Payment flow tested end-to-end
- [ ] Monitoring and logging configured

## 🎉 Success!

Once everything is working:

1. ✅ Your website is available at `https://3diot.vn`
2. ✅ SSL certificate auto-renews every 60 days
3. ✅ HTTP traffic automatically redirects to HTTPS
4. ✅ PayPal payments work securely over HTTPS
5. ✅ Production-ready security headers are active

Your IoT course payment system is now running securely with automatic HTTPS! 🚀

---

**Need help?** Check the logs first, then refer to [Caddy documentation](https://caddyserver.com/docs/). 