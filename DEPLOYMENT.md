# 🚀 Deployment Guide for 3diot.vn/embedded-course

## Overview
This guide explains how to deploy your PayPal payment system to serve at `3diot.vn/embedded-course` instead of the root domain.

## 🌐 URL Structure

### Production URLs:
- **Course page:** `https://3diot.vn/embedded-course/`
- **Checkout page:** `https://3diot.vn/embedded-course/checkout`
- **PayPal webhook:** `https://3diot.vn/embedded-course/paypal-webhook`
- **Health check:** `https://3diot.vn/embedded-course/health`

### Local Development URLs:
- **Course page:** `http://localhost:3000/`
- **Checkout page:** `http://localhost:3000/checkout`
- **PayPal webhook:** `http://localhost:3000/paypal-payment-success`

## 🛠️ Local Development Setup

### 1. **Standard Development (No Base Path):**
```bash
# Start the server normally
npm start

# Access at:
# http://localhost:3000/
```

### 2. **Development with Base Path (Test Production Setup):**
```bash
# Set BASE_PATH environment variable
export BASE_PATH="/embedded-course"
npm start

# Access at:
# http://localhost:3000/embedded-course/
```

## 🚀 Production Deployment

### Step 1: **Server Setup**

1. **Environment Configuration:**
```bash
# Create environment file
echo 'BASE_PATH="/embedded-course"' >> .env
```

2. **Update systemd service file:**
```bash
sudo nano /etc/systemd/system/course-pay.service
```

Add the environment variable:
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
Environment=BASE_PATH=/embedded-course

[Install]
WantedBy=multi-user.target
```

### Step 2: **Caddy Configuration**

Your `Caddyfile` is already configured for the `/embedded-course` path:

```caddyfile
3diot.vn {
    # Handle the embedded-course path and its sub-routes
    handle_path /embedded-course* {
        reverse_proxy localhost:3000
    }
    
    # Handle PayPal webhooks
    handle /embedded-course/paypal-payment-success {
        reverse_proxy localhost:3000
    }
    
    handle /embedded-course/paypal-webhook {
        reverse_proxy localhost:3000
    }
    
    # Root domain message
    handle / {
        respond "Welcome to 3DIoT! Visit /embedded-course for our IoT course." 200
    }
}
```

### Step 3: **Start Services**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Start Node.js application
sudo systemctl start course-pay
sudo systemctl enable course-pay

# Start Caddy
sudo caddy start --config Caddyfile

# Check status
sudo systemctl status course-pay
sudo caddy list
```

## 🔧 PayPal Configuration Updates

### 1. **Update Webhook URLs in PayPal Developer Console:**

Login to [developer.paypal.com](https://developer.paypal.com) and update:

- **Webhook URL:** `https://3diot.vn/embedded-course/paypal-webhook`
- **Return URL:** `https://3diot.vn/embedded-course/checkout`
- **Cancel URL:** `https://3diot.vn/embedded-course/`

### 2. **Test PayPal Integration:**

```bash
# Test the webhook endpoint
curl -X POST https://3diot.vn/embedded-course/paypal-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'

# Should return: {"received": true}
```

## 🧪 Testing Your Deployment

### 1. **Test URL Access:**
```bash
# Test main course page
curl -I https://3diot.vn/embedded-course/
# Should return: 200 OK

# Test checkout page
curl -I https://3diot.vn/embedded-course/checkout
# Should return: 200 OK

# Test health endpoint
curl https://3diot.vn/embedded-course/health
# Should return: {"status":"Server is running","basePath":"/embedded-course"}
```

### 2. **Test Root Domain:**
```bash
# Test root domain
curl https://3diot.vn/
# Should return: "Welcome to 3DIoT! Visit /embedded-course for our IoT course."
```

### 3. **Test Payment Flow:**
1. Visit: `https://3diot.vn/embedded-course/`
2. Click "Purchase Course Now"
3. Should redirect to: `https://3diot.vn/embedded-course/checkout`
4. Complete PayPal payment flow
5. Verify payment success

## 📊 Monitoring and Logs

### **View Application Logs:**
```bash
# Node.js application logs
sudo journalctl -u course-pay -f

# Caddy logs
sudo journalctl -u caddy -f
tail -f /var/log/caddy/3diot.vn.log
```

### **Check Application Status:**
```bash
# Check if Node.js is running
sudo systemctl status course-pay

# Check if Caddy is running
sudo systemctl status caddy

# Test health endpoint
curl https://3diot.vn/embedded-course/health
```

## 🔄 Path Structure Explanation

### **How It Works:**

1. **Caddy Configuration:**
   - `handle_path /embedded-course*` strips the `/embedded-course` prefix
   - Forwards clean paths to Node.js application
   - Example: `/embedded-course/checkout` → `/checkout` (to Node.js)

2. **Node.js Application:**
   - Uses `BASE_PATH` environment variable
   - Serves routes under the base path when configured
   - Maintains compatibility for local development

3. **Frontend JavaScript:**
   - Automatically detects if running under `/embedded-course`
   - Adjusts API calls and navigation accordingly

## 🌍 SEO and Analytics Considerations

### **Update Your Analytics:**
```javascript
// Google Analytics (if used)
gtag('config', 'GA_MEASUREMENT_ID', {
  page_location: 'https://3diot.vn/embedded-course/'
});
```

### **Update Sitemap:**
```xml
<!-- sitemap.xml -->
<url>
  <loc>https://3diot.vn/embedded-course/</loc>
  <lastmod>2024-01-01</lastmod>
  <priority>1.0</priority>
</url>
```

## 🚨 Troubleshooting

### **Common Issues:**

1. **404 Not Found on /embedded-course:**
   ```bash
   # Check Caddy configuration
   caddy validate --config Caddyfile
   
   # Restart Caddy
   sudo systemctl restart caddy
   ```

2. **PayPal Webhook Not Working:**
   ```bash
   # Check Node.js logs
   sudo journalctl -u course-pay -f
   
   # Test webhook manually
   curl -X POST https://3diot.vn/embedded-course/paypal-webhook \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

3. **Static Files Not Loading:**
   ```bash
   # Check BASE_PATH environment variable
   sudo systemctl show course-pay --property=Environment
   
   # Restart the service
   sudo systemctl restart course-pay
   ```

### **Debug Mode:**
```bash
# Run Node.js in debug mode
DEBUG=* BASE_PATH="/embedded-course" npm start

# Run Caddy in debug mode
sudo caddy run --config Caddyfile --debug
```

## ✅ Deployment Checklist

### **Pre-deployment:**
- [ ] DNS points `3diot.vn` to server IP
- [ ] Firewall allows ports 80, 443
- [ ] PayPal Business account configured
- [ ] PayPal Client ID updated in `checkout.html`

### **Deployment:**
- [ ] `BASE_PATH="/embedded-course"` set in environment
- [ ] Node.js service configured and started
- [ ] Caddy configured with updated `Caddyfile`
- [ ] HTTPS certificate obtained automatically

### **Post-deployment:**
- [ ] Test: `https://3diot.vn/embedded-course/` loads correctly
- [ ] Test: PayPal payment flow works end-to-end
- [ ] PayPal webhook URLs updated to new path
- [ ] Monitoring and logging configured

### **PayPal Configuration:**
- [ ] Webhook URL: `https://3diot.vn/embedded-course/paypal-webhook`
- [ ] Return URL: `https://3diot.vn/embedded-course/checkout`
- [ ] Production Client ID configured

## 🎉 Success!

Once deployed, your course will be available at:
- **📚 Course page:** `https://3diot.vn/embedded-course/`
- **💳 Secure checkout:** `https://3diot.vn/embedded-course/checkout`
- **🔒 HTTPS everywhere** with automatic SSL certificates
- **💰 PayPal payments** working with all major payment methods

Your IoT course payment system is now live at the custom path! 🚀

---

**Need help?** Check the logs first, then refer to `CADDY_SETUP.md` for detailed troubleshooting. 