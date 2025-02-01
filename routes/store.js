const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { isAuthenticated } = require('../middleware/auth');

// Get available packages
router.get('/packages', async (req, res) => {
    try {
        const packages = await stripe.products.list({
            active: true,
            type: 'service'
        });
        res.json(packages.data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch packages' });
    }
});

// Create subscription
router.post('/subscribe', isAuthenticated, async (req, res) => {
    try {
        const { package: packageName, price } = req.body;

        const session = await stripe.checkout.sessions.create({
            customer_email: req.user.email,
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${packageName} Package`,
                        description: `CraftVile Police RP ${packageName} Subscription`
                    },
                    unit_amount: Math.round(price * 100),
                    recurring: {
                        interval: 'month'
                    }
                },
                quantity: 1
            }],
            mode: 'subscription',
            success_url: `${process.env.BASE_URL}/store?success=true`,
            cancel_url: `${process.env.BASE_URL}/store?canceled=true`
        });

        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

// Purchase individual item
router.post('/purchase', isAuthenticated, async (req, res) => {
    try {
        const { item, price } = req.body;

        const session = await stripe.checkout.sessions.create({
            customer_email: req.user.email,
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item,
                        description: `CraftVile Police RP Store Item: ${item}`
                    },
                    unit_amount: Math.round(price * 100)
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${process.env.BASE_URL}/store?success=true`,
            cancel_url: `${process.env.BASE_URL}/store?canceled=true`
        });

        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: 'Failed to process purchase' });
    }
});

// Process donation
router.post('/donate', isAuthenticated, async (req, res) => {
    try {
        const { amount } = req.body;

        const session = await stripe.checkout.sessions.create({
            customer_email: req.user.email,
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Donation',
                        description: 'Support CraftVile Police RP'
                    },
                    unit_amount: Math.round(amount * 100)
                },
                quantity: 1
            }],
            mode: 'payment',
            success_url: `${process.env.BASE_URL}/store?success=true`,
            cancel_url: `${process.env.BASE_URL}/store?canceled=true`
        });

        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: 'Failed to process donation' });
    }
});

// Webhook for handling Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            // Handle successful payment
            await handleSuccessfulPayment(session);
            break;
        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            // Handle subscription cancellation
            await handleSubscriptionCancellation(subscription);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

async function handleSuccessfulPayment(session) {
    // Implement payment success logic
    // e.g., update user's permissions, send confirmation email, etc.
}

async function handleSubscriptionCancellation(subscription) {
    // Implement subscription cancellation logic
    // e.g., remove user's permissions, send cancellation email, etc.
}

module.exports = router; 