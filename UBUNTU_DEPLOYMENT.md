# 🐧 Ubuntu Background Deployment Guide

Complete guide for running your IoT Course Payment System in the background on Ubuntu.

## 🚀 Quick Start (Recommended)

### **Option 1: Automated Deployment Script**
```bash
# Make the script executable
chmod +x ubuntu-deploy.sh

# Run the deployment script
./ubuntu-deploy.sh
```

## 📋 Manual Deployment Options

### **Option 1: PM2 Process Manager (Recommended)**

#### **Install PM2:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

#### **Deploy with PM2:**
```bash
# Navigate to your project
cd /path/to/course_pay

# Install dependencies
npm install

# Create logs directory
mkdir -p logs

# Start with PM2 using ecosystem file
pm2 start ecosystem.config.js --env production

# OR start manually
pm2 start server.js --name "course-payment" --env production

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

#### **PM2 Management Commands:**
```bash
# View status
pm2 status

# View logs
pm2 logs course-payment

# Monitor in real-time
pm2 monit

# Restart application
pm2 restart course-payment

# Stop application
pm2 stop course-payment

# Delete application
pm2 delete course-payment

# Reload with zero downtime
pm2 reload course-payment
```

### **Option 2: Systemd Service**

#### **Setup Systemd Service:**
```bash
# Copy the service file
sudo cp course-payment.service /etc/systemd/system/

# Edit the service file with correct paths
sudo nano /etc/systemd/system/course-payment.service

# Update these lines in the service file:
# WorkingDirectory=/home/ubuntu/course_pay
# User=ubuntu (or your username)

# Reload systemd
sudo systemctl daemon-reload

# Enable the service
sudo systemctl enable course-payment

# Start the service
sudo systemctl start course-payment

# Check status
sudo systemctl status course-payment
```

#### **Systemd Management Commands:**
```bash
# Start service
sudo systemctl start course-payment

# Stop service
sudo systemctl stop course-payment

# Restart service
sudo systemctl restart course-payment

# Check status
sudo systemctl status course-payment

# View logs
sudo journalctl -u course-payment -f

# Enable auto-start on boot
sudo systemctl enable course-payment
```

### **Option 3: Screen Session (Development)**

```bash
# Install screen
sudo apt install screen

# Start a new screen session
screen -S payment-server

# Navigate to project and start server
cd /path/to/course_pay
npm start

# Detach from screen (Ctrl+A, then D)
# Reattach to screen
screen -r payment-server

# List screen sessions
screen -ls
```

### **Option 4: Tmux Session (Development)**

```bash
# Install tmux
sudo apt install tmux

# Start new tmux session
tmux new-session -d -s payment-server

# Run commands in session
tmux send-keys -t payment-server "cd /path/to/course_pay" Enter
tmux send-keys -t payment-server "npm start" Enter

# Attach to session
tmux attach-session -t payment-server

# Detach (Ctrl+B, then D)
# List sessions
tmux list-sessions
```

### **Option 5: Nohup (Simple Background)**

```bash
# Run in background with nohup
cd /path/to/course_pay
nohup npm start > server.log 2>&1 &

# View the process ID
echo $!

# View logs
tail -f server.log

# Kill the process
kill $(cat server.log.pid)  # if you saved the PID
# or
ps aux | grep node  # find PID and kill
kill PID_NUMBER
```

## 🔒 Security & Firewall Setup

```bash
# Allow application port
sudo ufw allow 3000/tcp

# If using custom port (e.g., 8080)
sudo ufw allow 8080/tcp

# Enable firewall
sudo ufw --force enable

# Check firewall status
sudo ufw status
```

## 🌐 Nginx Reverse Proxy (Optional)

### **Install Nginx:**
```bash
sudo apt install nginx
```

### **Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/course-payment
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /embedded-course {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/course-payment /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 📊 Monitoring & Logs

### **PM2 Monitoring:**
```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs

# Flush logs
pm2 flush

# Web monitoring (optional)
pm2 web
```

### **System Logs:**
```bash
# Application logs (if using systemd)
sudo journalctl -u course-payment -f

# System logs
sudo tail -f /var/log/syslog

# Application specific logs
tail -f /path/to/course_pay/logs/combined.log
```

## 🔧 Environment Variables

Create a `.env` file:
```bash
nano /path/to/course_pay/.env
```

Add:
```env
NODE_ENV=production
PORT=3000
BASE_PATH=/embedded-course
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

## 🎯 Testing Deployment

```bash
# Test local server
curl http://localhost:3000

# Test with base path
curl http://localhost:3000/embedded-course

# Test from outside server
curl http://your-server-ip:3000
```

## 🆘 Troubleshooting

### **Common Issues:**

#### **Port already in use:**
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 PID
```

#### **Permission issues:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/course_pay
chmod +x ubuntu-deploy.sh
```

#### **Node.js not found:**
```bash
# Check Node.js installation
which node
node --version

# Add to PATH if needed
echo 'export PATH=$PATH:/usr/bin' >> ~/.bashrc
source ~/.bashrc
```

#### **PM2 command not found:**
```bash
# Install PM2 with correct permissions
sudo npm install -g pm2 --unsafe-perm
```

## 🎉 Success!

Your IoT Course Payment System is now running in the background on Ubuntu!

**Quick Commands:**
- **Start:** `pm2 start course-payment`
- **Stop:** `pm2 stop course-payment`
- **Restart:** `pm2 restart course-payment`
- **Logs:** `pm2 logs course-payment`
- **Status:** `pm2 status`

**Access URLs:**
- **Main page:** `http://your-server-ip:3000`
- **Checkout:** `http://your-server-ip:3000/checkout`
- **With base path:** `http://your-domain.com/embedded-course`

**Next Steps:**
1. Configure SSL with Let's Encrypt
2. Setup domain name
3. Configure PayPal webhooks
4. Test payment flow
5. Monitor logs and performance

---

**Need help?** Check the logs first:
- PM2: `pm2 logs course-payment`
- Systemd: `sudo journalctl -u course-payment -f`
- Application: `tail -f logs/combined.log` 