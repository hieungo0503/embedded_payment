const express = require('express');
const stripe = require('stripe')('sk_test_YOUR_STRIPE_SECRET_KEY'); // Replace with your actual secret key
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Serve the main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

// Create payment intent endpoint
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', customer_email, customer_name } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Stripe uses cents, so $99.00 = 9900 cents
            currency: currency,
            metadata: {
                course_name: 'IoT Embedded Systems Design Course',
                customer_email: customer_email,
                customer_name: customer_name
            },
            receipt_email: customer_email, // Send receipt to customer
            description: 'IoT Embedded Systems Design Course - Complete hands-on training'
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(400).send({
            error: {
                message: error.message,
            },
        });
    }
});

// Confirm payment and handle post-payment actions
app.post('/confirm-payment', async (req, res) => {
    try {
        const { payment_intent_id } = req.body;

        // Retrieve the payment intent to get details
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

        if (paymentIntent.status === 'succeeded') {
            // Payment successful - you can add your business logic here
            console.log('Payment succeeded:', paymentIntent.id);
            console.log('Customer email:', paymentIntent.metadata.customer_email);
            console.log('Amount received:', paymentIntent.amount / 100, paymentIntent.currency.toUpperCase());

            // Here you can:
            // 1. Send course access email
            // 2. Add user to your course platform
            // 3. Update your database
            // 4. Send confirmation emails

            res.send({
                success: true,
                message: 'Payment processed successfully',
                transaction_id: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency
            });
        } else {
            res.status(400).send({
                success: false,
                message: 'Payment was not successful'
            });
        }
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(400).send({
            success: false,
            error: error.message
        });
    }
});

// Webhook endpoint for Stripe events (optional but recommended for production)
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = 'whsec_YOUR_WEBHOOK_SECRET'; // Replace with your webhook secret

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!', paymentIntent.id);

            // Here you can reliably process the successful payment
            // This is the most secure way to handle post-payment actions
            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;
            console.log('PaymentMethod was attached to a Customer!');
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`💰 Payment server running on http://localhost:${PORT}`);
    console.log(`📊 Visit http://localhost:${PORT} to view your course page`);
    console.log(`💳 Checkout page: http://localhost:${PORT}/checkout`);
    console.log(`🔧 Make sure to update your Stripe keys in the code!`);
});

module.exports = app; 