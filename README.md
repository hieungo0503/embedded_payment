# 💳 IoT Course Payment System

**Professional PayPal Payment Processing System** - Money goes directly to YOUR PayPal account!

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your PayPal Business account:**
   - Create account at [paypal.com/business](https://www.paypal.com/business/)
   - Get your Client ID from [PayPal Developer](https://developer.paypal.com/)
   - Edit `checkout.html`: Replace `YOUR_PAYPAL_CLIENT_ID` with your actual Client ID

3. **Configure EmailJS (optional):**
   - Edit `checkout.html`: Replace `YOUR_EMAILJS_PUBLIC_KEY`, `YOUR_SERVICE_ID`, `YOUR_TEMPLATE_ID`

4. **Start the server:**
   ```bash
   npm start
   ```

5. **Visit your course page:**
   ```
   http://localhost:3000
   ```

## 🏦 PayPal Business Account Setup

1. **Create PayPal Business Account:**
   - Go to [paypal.com/business](https://www.paypal.com/business/)
   - Upgrade your personal account or create new business account (FREE)
   - Complete business verification to receive payments

2. **Get PayPal Client ID:**
   - Visit [PayPal Developer](https://developer.paypal.com/)
   - Go to "My Apps & Credentials"
   - Create new app and copy the **Client ID**
   - Use **Sandbox** for testing, **Live** for real payments

3. **Update your code:**
   - Replace `YOUR_PAYPAL_CLIENT_ID` in `checkout.html` with your actual Client ID

## 💰 Accepted Payment Methods

Your customers can pay using:

### Credit/Debit Cards:
- 💳 **Visa** - Worldwide acceptance
- 💳 **MasterCard** - Global payment processing  
- 💳 **American Express** - Premium card support
- 💳 **Discover** - US-based card network
- 💳 **JCB** - Japanese card network
- 💳 **Diners Club** - Travel and entertainment card
- 💳 **UnionPay** - Chinese payment network

### PayPal Methods:
- 💰 **PayPal Balance** - Direct account funds
- 💳 **PayPal Credit** - Buy now, pay later
- 🎁 **PayPal Rewards** - Cashback and points

## 🧪 Test Payment (Sandbox)

1. **Use PayPal Sandbox:**
   - Use your sandbox Client ID in `checkout.html`
   - Create test buyer accounts in PayPal Developer
   - Test with sandbox credentials (no real money processed)

2. **Test Flow:**
   - Fill in customer information
   - Click PayPal button
   - Login with sandbox buyer account
   - Complete test payment

## 📁 Project Structure

```
course_pay/
├── index.html          # Course landing page with hero section
├── checkout.html       # PayPal payment checkout page  
├── server.js           # Payment processing server
├── package.json        # Node.js dependencies
├── PAYMENT_SETUP.md    # Detailed setup guide
└── README.md           # This file
```

## ✨ Features

- ✅ **PayPal payment processing** - All major cards + PayPal methods
- ✅ **Global payment acceptance** - Customers worldwide can pay
- ✅ **Automatic email receipts** - EmailJS integration
- ✅ **Mobile-responsive design** - Works on all devices
- ✅ **Real-time form validation** - Better user experience
- ✅ **Secure payment processing** - PayPal handles all security
- ✅ **Professional UI/UX** - Modern glassmorphism design
- ✅ **Multiple payment methods** - Credit cards, PayPal balance, PayPal Credit

## 🌍 Global Payment Support

Accept payments from customers in:
- 🇺🇸 United States - All payment methods
- 🇪🇺 Europe - Visa, MasterCard, PayPal
- 🇯🇵 Japan - JCB, Visa, MasterCard  
- 🇨🇳 China - UnionPay
- 🇻🇳 Vietnam - Local and international cards
- 🌏 **200+ countries** supported by PayPal

## 💡 Need Help?

📖 **Read the detailed setup guide:** `PAYMENT_SETUP.md`

🔧 **Common Setup Steps:**
1. Create PayPal Business account (free)
2. Get Client ID from PayPal Developer
3. Update `checkout.html` with your Client ID
4. Test with sandbox before going live

## 🚀 Go Live Checklist

- [ ] PayPal Business account created and verified
- [ ] Client ID added to `checkout.html`  
- [ ] EmailJS configured for receipts
- [ ] Tested with PayPal sandbox
- [ ] Switched to live Client ID
- [ ] SSL certificate installed (for production)

---

**🎉 Ready to accept payments from customers worldwide!**

*Your customers can pay with any major credit card or PayPal method - money goes directly to your PayPal account!* 