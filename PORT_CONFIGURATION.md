# 🔧 Port Configuration Guide - Running Alongside Existing Web Server

## Problem
Your server already has a web server (Apache, Nginx, or another Caddy instance) using ports 80 and 443, causing this error:
```
Error: listening on :443: listen tcp :443: bind: address already in use
```

## 🚀 Solution Options

### Option 1: Custom Ports (Recommended)
Run Caddy on different ports alongside your existing web server.

### Option 2: Reverse Proxy  
Use your existing web server to proxy requests to the Node.js application.

### Option 3: Local Access Only
Run without HTTPS for local/internal access only.

---

## 🎯 Option 1: Custom Ports Configuration

### **Updated URLs:**
- **Course page:** `https://3diot.vn:8443/embedded-course/`
- **Checkout:** `https://3diot.vn:8443/embedded-course/checkout`
- **HTTP redirect:** `http://3diot.vn:8080/` → `https://3diot.vn:8443/`

### **Firewall Configuration:**

#### **Ubuntu/Debian:**
```bash
# Open custom ports
sudo ufw allow 8080/tcp
sudo ufw allow 8443/tcp
sudo ufw reload

# Check status
sudo ufw status
```

#### **CentOS/RHEL:**
```bash
# Open custom ports
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --permanent --add-port=8443/tcp
sudo firewall-cmd --reload

# Check status
sudo firewall-cmd --list-ports
```

### **Start Your Application:**
```bash
# Start Node.js application
BASE_PATH="/embedded-course" npm start

# Start Caddy with custom ports
sudo caddy run --config Caddyfile

# Access at: https://3diot.vn:8443/embedded-course/
```

### **Test Custom Port Setup:**
```bash
# Test HTTPS on custom port
curl -I https://3diot.vn:8443/embedded-course/
# Should return: 200 OK

# Test HTTP redirect
curl -I http://3diot.vn:8080/
# Should redirect to HTTPS port 8443
```

---

## 🔄 Option 2: Reverse Proxy Configuration

Use your existing web server to proxy requests to the Node.js application.

### **A. Nginx Configuration**

Create `/etc/nginx/sites-available/3diot-course`:
```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name 3diot.vn;

    # SSL configuration (use your existing certificates)
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/key.pem;

    # Proxy embedded-course to Node.js app
    location /embedded-course/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Remove /embedded-course prefix when forwarding
        rewrite ^/embedded-course/(.*) /$1 break;
    }

    # Handle PayPal webhooks
    location /embedded-course/paypal-webhook {
        proxy_pass http://localhost:3000/paypal-webhook;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /embedded-course/paypal-payment-success {
        proxy_pass http://localhost:3000/paypal-payment-success;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Your existing site configuration can go here
    location / {
        # Your existing root configuration
        try_files $uri $uri/ =404;
    }
}
```

Enable the configuration:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/3diot-course /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### **B. Apache Configuration**

Add to your existing virtual host or create new one:
```apache
<VirtualHost *:80>
<VirtualHost *:443>
    ServerName 3diot.vn
    
    # Enable required modules
    LoadModule proxy_module modules/mod_proxy.so
    LoadModule proxy_http_module modules/mod_proxy_http.so
    LoadModule rewrite_module modules/mod_rewrite.so

    # SSL configuration (if HTTPS)
    SSLEngine on
    SSLCertificateFile /path/to/your/cert.pem
    SSLCertificateKeyFile /path/to/your/key.pem

    # Proxy embedded-course to Node.js
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Handle embedded-course path
    RewriteEngine On
    RewriteRule ^/embedded-course/(.*)$ http://localhost:3000/$1 [P,L]
    RewriteRule ^/embedded-course$ http://localhost:3000/ [P,L]
    
    # Handle PayPal webhooks
    ProxyPass /embedded-course/paypal-webhook http://localhost:3000/paypal-webhook
    ProxyPassReverse /embedded-course/paypal-webhook http://localhost:3000/paypal-webhook
    
    ProxyPass /embedded-course/paypal-payment-success http://localhost:3000/paypal-payment-success
    ProxyPassReverse /embedded-course/paypal-payment-success http://localhost:3000/paypal-payment-success

    # Your existing site content
    DocumentRoot /var/www/html
</VirtualHost>
```

Restart Apache:
```bash
sudo systemctl restart apache2  # Ubuntu/Debian
sudo systemctl restart httpd    # CentOS/RHEL
```

### **C. For Reverse Proxy Setup:**

1. **Don't use Caddy** - Let your existing server handle HTTPS
2. **Start only Node.js:**
```bash
BASE_PATH="/embedded-course" npm start
```

3. **Update PayPal URLs:**
- **Webhook:** `https://3diot.vn/embedded-course/paypal-webhook`
- **Return URL:** `https://3diot.vn/embedded-course/checkout`

---

## 🏠 Option 3: Local Access Only

For development or internal access without HTTPS:

### **Simple Caddyfile (local-only):**
```caddyfile
# Local development configuration
localhost:8080 {
    handle_path /embedded-course* {
        reverse_proxy localhost:3000
    }
    
    handle /embedded-course/paypal-payment-success {
        reverse_proxy localhost:3000
    }
    
    handle /embedded-course/paypal-webhook {
        reverse_proxy localhost:3000
    }
    
    handle / {
        respond "Visit /embedded-course for the IoT course" 200
    }
}
```

**Access at:** `http://localhost:8080/embedded-course/`

---

## 📊 Comparison of Options

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Custom Ports** | ✅ Independent<br>✅ Full Caddy features<br>✅ Auto HTTPS | ❌ Non-standard ports<br>❌ Users need port in URL | Separate services |
| **Reverse Proxy** | ✅ Standard ports<br>✅ Clean URLs<br>✅ Integrated with existing | ❌ More complex<br>❌ Depends on existing server | Existing web server |
| **Local Only** | ✅ Simple setup<br>✅ No port conflicts | ❌ No HTTPS<br>❌ Local access only | Development/testing |

---

## 🔧 Recommended Setup Steps

### **For Custom Ports (Option 1):**
```bash
# 1. Open firewall ports
sudo ufw allow 8080/tcp 8443/tcp

# 2. Start services
BASE_PATH="/embedded-course" npm start
sudo caddy run --config Caddyfile

# 3. Test access
curl -I https://3diot.vn:8443/embedded-course/

# 4. Update PayPal webhook URLs to include port :8443
```

### **For Reverse Proxy (Option 2):**
```bash
# 1. Configure your existing web server (Nginx/Apache)
# 2. Start only Node.js
BASE_PATH="/embedded-course" npm start

# 3. Test access
curl -I https://3diot.vn/embedded-course/

# 4. PayPal URLs remain standard (no port needed)
```

## 🚨 Troubleshooting

### **Port Already in Use:**
```bash
# Check what's using the ports
sudo netstat -tlnp | grep :443
sudo lsof -i :443

# Check your processes
sudo systemctl status nginx
sudo systemctl status apache2
sudo systemctl status caddy
```

### **Firewall Issues:**
```bash
# Check firewall status
sudo ufw status verbose

# Check if ports are open
telnet 3diot.vn 8443
nmap -p 8443 3diot.vn
```

### **SSL Certificate Issues (Custom Ports):**
```bash
# Caddy handles Let's Encrypt automatically for custom ports
# Check Caddy logs
sudo journalctl -u caddy -f

# Manual certificate test
openssl s_client -connect 3diot.vn:8443
```

## 🎯 PayPal Configuration Updates

### **For Custom Ports (Option 1):**
- **Webhook URL:** `https://3diot.vn:8443/embedded-course/paypal-webhook`
- **Return URL:** `https://3diot.vn:8443/embedded-course/checkout`

### **For Reverse Proxy (Option 2):**
- **Webhook URL:** `https://3diot.vn/embedded-course/paypal-webhook`
- **Return URL:** `https://3diot.vn/embedded-course/checkout`

## 🎉 Success!

Choose the option that works best for your setup:

- **Option 1 (Custom Ports):** Quick and independent
- **Option 2 (Reverse Proxy):** Professional and integrated  
- **Option 3 (Local Only):** Simple for development

Your IoT course payment system will work alongside your existing web server! 🚀 