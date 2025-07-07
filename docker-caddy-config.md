# 🐳 Using Your Existing Docker Caddy

If you prefer to use standard ports (80/443) and integrate with your existing Docker Caddy:

## 📝 **Add to Docker Caddy Configuration**

### **If using Caddyfile in Docker:**
Add this to your Docker Caddy's Caddyfile:

```caddyfile
# Add this to your existing Caddyfile
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

### **If using Docker Compose:**
Add this to your `docker-compose.yml`:

```yaml
services:
  caddy:
    # Your existing Caddy config
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

## 🔧 **Setup Steps:**

1. **Don't start standalone Caddy** - Use Docker one only
2. **Start your Node.js app:**
   ```bash
   BASE_PATH="/embedded-course" npm start
   ```
3. **Restart Docker Caddy:**
   ```bash
   docker-compose restart caddy
   ```

## 🌐 **Your URLs (Standard Ports):**
- **Course:** `https://3diot.vn/embedded-course/`
- **Checkout:** `https://3diot.vn/embedded-course/checkout`

## 🎯 **PayPal URLs (Standard Ports):**
- **Webhook:** `https://3diot.vn/embedded-course/paypal-webhook`
- **Return URL:** `https://3diot.vn/embedded-course/checkout` 