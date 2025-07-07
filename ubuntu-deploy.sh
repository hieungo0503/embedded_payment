#!/bin/bash

# Ubuntu Deployment Script for IoT Course Payment System
# Run this script on your Ubuntu server

echo "🚀 Starting Ubuntu deployment for IoT Course Payment System..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm if not already installed
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally
echo "🔧 Installing PM2..."
sudo npm install -g pm2

# Navigate to project directory
PROJECT_DIR="/home/ubuntu/course_pay"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "📁 Creating project directory..."
    mkdir -p $PROJECT_DIR
fi

cd $PROJECT_DIR

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

# Set environment variables
echo "🔧 Setting up environment variables..."
export NODE_ENV=production
export PORT=3000
export BASE_PATH=/embedded-course

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start server.js --name "course-payment" --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup ubuntu -u ubuntu --hp /home/ubuntu

# Show status
echo "✅ Deployment complete! Application status:"
pm2 status

echo ""
echo "🎉 Your IoT Course Payment System is now running in background!"
echo "📊 View logs: pm2 logs course-payment"
echo "🔄 Restart app: pm2 restart course-payment"
echo "⏹️  Stop app: pm2 stop course-payment"
echo "🗑️  Delete app: pm2 delete course-payment"

# Setup firewall (optional)
echo ""
echo "🔒 Setting up firewall (optional)..."
sudo ufw allow 3000/tcp
sudo ufw --force enable

echo "🌐 Your server is accessible at: http://your-server-ip:3000"
echo "💳 Checkout page: http://your-server-ip:3000/checkout" 