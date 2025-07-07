# 🐳 Docker Caddy Troubleshooting Guide

## 🚨 Common Issues & Solutions

### **Issue 1: Node.js App Not Running**

**Symptoms:** 502 Bad Gateway, connection refused

**Solution:**
```bash
# 1. Start your Node.js application
cd /path/to/course_pay
BASE_PATH="/embedded-course" npm start

# 2. Verify it's running
curl http://localhost:3000/health
# Should return: {"status":"Server is running","basePath":"/embedded-course"}

# 3. Test the embedded-course path
curl http://localhost:3000/embedded-course/
# Should return your course page HTML
```

### **Issue 2: Docker Can't Reach Host**

**Symptoms:** 502 Bad Gateway, "no such host"

**Problem:** Docker container can't access `localhost:3000` on the host

**Solutions:**

#### **Option A: Use host.docker.internal (Recommended)**
```yaml
# In your docker-compose.yml
services:
  caddy:
    # Your existing config
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

Update your Caddy config to use `host.docker.internal:3000` instead of `localhost:3000`

#### **Option B: Use Host Network Mode**
```yaml
# In your docker-compose.yml
services:
  caddy:
    network_mode: "host"
    # Rest of your config
```

#### **Option C: Use Docker Host IP**
```bash
# Find your Docker host IP
ip route show default | awk '/default/ {print $3}'

# Use this IP instead of localhost
# Example: 172.17.0.1:3000
```

### **Issue 3: Incorrect Caddy Configuration**

**Check your current Docker Caddy config:**

```bash
# If using docker-compose
docker-compose exec caddy cat /etc/caddy/Caddyfile

# If using standalone docker
docker exec <caddy-container-name> cat /etc/caddy/Caddyfile
```

**Correct configuration should include:**
```caddyfile
3diot.vn {
    # Handle embedded-course path
    handle_path /embedded-course* {
        reverse_proxy host.docker.internal:3000
    }
    
    # Handle PayPal webhooks
    handle /embedded-course/paypal-payment-success {
        reverse_proxy host.docker.internal:3000
    }
    
    handle /embedded-course/paypal-webhook {
        reverse_proxy host.docker.internal:3000
    }
    
    # Your existing site configuration...
    handle / {
        # Your existing root handler
    }
}
```

### **Issue 4: BASE_PATH Not Set**

**Problem:** Node.js app running without BASE_PATH environment variable

**Solution:**
```bash
# Stop current Node.js process
pkill node

# Start with BASE_PATH
BASE_PATH="/embedded-course" npm start

# Or set environment variable permanently
export BASE_PATH="/embedded-course"
npm start
```

### **Issue 5: Port Conflicts**

**Check if port 3000 is already in use:**
```bash
# Check what's using port 3000
sudo netstat -tlnp | grep :3000
sudo lsof -i :3000

# If something else is using it, change port
PORT=3001 BASE_PATH="/embedded-course" npm start

# Update Caddy config to use port 3001
```

## 🔧 **Step-by-Step Diagnostic**

### **Step 1: Verify Node.js App**
```bash
# 1. Start Node.js with correct environment
cd /path/to/course_pay
BASE_PATH="/embedded-course" npm start

# 2. Test local access
curl http://localhost:3000/embedded-course/
curl http://localhost:3000/embedded-course/health

# 3. Check logs for errors
# Look for any error messages in the Node.js console
```

### **Step 2: Test Docker Network Connectivity**
```bash
# Test if Docker can reach your host
docker run --rm alpine/curl curl -I http://host.docker.internal:3000/embedded-course/

# Should return: HTTP/1.1 200 OK
# If fails: network connectivity issue
```

### **Step 3: Check Docker Caddy Configuration**
```bash
# View current Caddy config
docker-compose exec caddy cat /etc/caddy/Caddyfile

# Check Caddy logs
docker-compose logs caddy

# Look for errors like:
# - "no such host"
# - "connection refused"
# - "502 Bad Gateway"
```

### **Step 4: Test Caddy Reload**
```bash
# After updating Caddy config, reload
docker-compose exec caddy caddy reload --config /etc/caddy/Caddyfile

# Or restart the container
docker-compose restart caddy
```

## 🚀 **Complete Working Example**

### **1. Docker Compose File (docker-compose.yml):**
```yaml
version: '3.8'
services:
  caddy:
    image: caddy:latest
    container_name: caddy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    extra_hosts:
      - "host.docker.internal:host-gateway"
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
```

### **2. Caddy Configuration (Caddyfile):**
```caddyfile
3diot.vn {
    # Handle embedded-course path and sub-routes
    handle_path /embedded-course* {
        reverse_proxy host.docker.internal:3000
    }
    
    # Handle PayPal webhooks specifically
    handle /embedded-course/paypal-payment-success {
        reverse_proxy host.docker.internal:3000
    }
    
    handle /embedded-course/paypal-webhook {
        reverse_proxy host.docker.internal:3000
    }
    
    handle /embedded-course/health {
        reverse_proxy host.docker.internal:3000
    }
    
    # Default handler for other paths
    handle / {
        file_server
        root /var/www/html
    }
    
    # Enable logging
    log {
        output file /var/log/caddy/access.log
    }
}
```

### **3. Start Everything:**
```bash
# 1. Start Node.js application
BASE_PATH="/embedded-course" npm start

# 2. Start Docker Caddy
docker-compose up -d caddy

# 3. Test access
curl -I https://3diot.vn/embedded-course/
```

## 🧪 **Testing Commands**

### **Test 1: Local Node.js**
```bash
curl http://localhost:3000/embedded-course/
# Expected: Course page HTML

curl http://localhost:3000/embedded-course/health
# Expected: {"status":"Server is running","basePath":"/embedded-course"}
```

### **Test 2: Docker Network**
```bash
# Test from inside Docker container
docker-compose exec caddy wget -qO- http://host.docker.internal:3000/embedded-course/health
# Expected: {"status":"Server is running","basePath":"/embedded-course"}
```

### **Test 3: Full Path**
```bash
curl -I https://3diot.vn/embedded-course/
# Expected: HTTP/1.1 200 OK

curl -I https://3diot.vn/embedded-course/checkout
# Expected: HTTP/1.1 200 OK
```

## 🚨 **Common Error Messages & Fixes**

### **Error: "502 Bad Gateway"**
```bash
# Cause: Node.js not running or Docker can't reach it
# Fix:
BASE_PATH="/embedded-course" npm start

# Check Docker can reach host
docker run --rm alpine/curl curl http://host.docker.internal:3000/embedded-course/health
```

### **Error: "no such host: localhost"**
```bash
# Cause: Docker trying to reach localhost instead of host
# Fix: Update Caddy config to use host.docker.internal:3000
```

### **Error: "connection refused"**
```bash
# Cause: Port 3000 not accessible or firewall blocking
# Fix:
sudo ufw allow 3000/tcp
# Or check if another process is using port 3000
```

### **Error: "404 Not Found"**
```bash
# Cause: BASE_PATH not set or incorrect routing
# Fix:
export BASE_PATH="/embedded-course"
npm start

# Verify routing
curl http://localhost:3000/embedded-course/
```

## 🔄 **Quick Recovery Steps**

### **Option 1: Full Reset**
```bash
# 1. Stop everything
docker-compose down
pkill node

# 2. Start Node.js with correct config
BASE_PATH="/embedded-course" npm start

# 3. Update Docker Caddy config
# 4. Start Docker Caddy
docker-compose up -d

# 5. Test
curl -I https://3diot.vn/embedded-course/
```

### **Option 2: Use Different Port**
```bash
# If port 3000 conflicts
PORT=3001 BASE_PATH="/embedded-course" npm start

# Update Caddy config to use :3001
# Restart Caddy
docker-compose restart caddy
```

### **Option 3: Debug Mode**
```bash
# Run with debug logging
DEBUG=* BASE_PATH="/embedded-course" npm start

# Check Docker Caddy logs
docker-compose logs -f caddy
```

## 📋 **Checklist**

Before asking for help, verify:

- [ ] **Node.js running:** `curl http://localhost:3000/embedded-course/health`
- [ ] **BASE_PATH set:** Environment variable `/embedded-course`
- [ ] **Docker config updated:** Includes `host.docker.internal:3000`
- [ ] **Caddy reloaded:** After config changes
- [ ] **Ports open:** 3000 accessible
- [ ] **Network connectivity:** Docker can reach host
- [ ] **Logs checked:** Both Node.js and Caddy logs

Let me know which specific error message you're seeing! 🚀 