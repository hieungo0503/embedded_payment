const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Base path for the application when served under /embedded-course
const BASE_PATH = process.env.BASE_PATH || '';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files under the base path
if (BASE_PATH) {
    app.use(BASE_PATH, express.static('.'));
} else {
    app.use(express.static('.'));
}

// Root route - serve the main course page
app.get(BASE_PATH + '/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Checkout route
app.get(BASE_PATH + '/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

// Support for both with and without base path for local development
if (BASE_PATH === '') {
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    app.get('/checkout', (req, res) => {
        res.sendFile(path.join(__dirname, 'checkout.html'));
    });
}

// PayPal payment confirmation endpoint
app.post(BASE_PATH + '/paypal-payment-success', async (req, res) => {
    try {
        const { orderID, payerID, paymentID, amount, currency, customer_email, customer_name } = req.body;

        // Log successful payment details
        console.log('PayPal payment succeeded:', {
            orderID,
            payerID,
            paymentID,
            amount,
            currency,
            customer_email,
            customer_name
        });

        // Here you can add your business logic:
        // 1. Send course access email
        // 2. Add user to your course platform
        // 3. Update your database
        // 4. Send confirmation emails

        res.send({
            success: true,
            message: 'Payment processed successfully',
            transaction_id: orderID || paymentID,
            amount: amount,
            currency: currency || 'USD'
        });
    } catch (error) {
        console.error('Error processing PayPal payment:', error);
        res.status(400).send({
            success: false,
            error: error.message
        });
    }
});

// PayPal webhook endpoint for payment notifications
app.post(BASE_PATH + '/paypal-webhook', express.raw({ type: 'application/json' }), (req, res) => {
    try {
        const event = req.body;

        // Log the webhook event
        console.log('PayPal webhook received:', event);

        // Handle different PayPal webhook events
        if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
            const payment = event.resource;
            console.log('PayPal payment capture completed:', payment.id);

            // Process the successful payment
            // This is the most secure way to handle post-payment actions
        }

        res.json({ received: true });
    } catch (error) {
        console.error('PayPal webhook error:', error);
        res.status(400).send('Webhook Error');
    }
});

// Health check endpoint
app.get(BASE_PATH + '/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString(), basePath: BASE_PATH });
});

// Support for local development without base path
if (BASE_PATH === '') {
    app.post('/paypal-payment-success', async (req, res) => {
        // Duplicate the logic from the base path version
        try {
            const { orderID, payerID, paymentID, amount, currency, customer_email, customer_name } = req.body;

            console.log('PayPal payment succeeded:', {
                orderID,
                payerID,
                paymentID,
                amount,
                currency,
                customer_email,
                customer_name
            });

            res.send({
                success: true,
                message: 'Payment processed successfully',
                transaction_id: orderID || paymentID,
                amount: amount,
                currency: currency || 'USD'
            });
        } catch (error) {
            console.error('Error processing PayPal payment:', error);
            res.status(400).send({
                success: false,
                error: error.message
            });
        }
    });

    app.post('/paypal-webhook', express.raw({ type: 'application/json' }), (req, res) => {
        try {
            const event = req.body;
            console.log('PayPal webhook received:', event);

            if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
                const payment = event.resource;
                console.log('PayPal payment capture completed:', payment.id);
            }

            res.json({ received: true });
        } catch (error) {
            console.error('PayPal webhook error:', error);
            res.status(400).send('Webhook Error');
        }
    });

    app.get('/health', (req, res) => {
        res.json({ status: 'Server is running', timestamp: new Date().toISOString(), basePath: 'local' });
    });
}

app.listen(PORT, () => {
    console.log(`💰 Payment server running on http://localhost:${PORT}`);
    console.log(`📊 Visit http://localhost:${PORT} to view your course page`);
    console.log(`💳 Checkout page: http://localhost:${PORT}/checkout`);
    console.log(`🔧 Make sure to update your PayPal client ID in the HTML files!`);
});

module.exports = app; 