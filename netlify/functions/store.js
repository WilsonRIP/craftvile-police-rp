const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { action, ...data } = JSON.parse(event.body);

    switch (action) {
      case 'subscribe':
        return await handleSubscription(data);
      case 'purchase':
        return await handlePurchase(data);
      case 'donate':
        return await handleDonation(data);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Store error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function handleSubscription({ package: packageName, price, steamId }) {
  try {
    // Create or retrieve customer
    const customer = await getOrCreateCustomer(steamId);

    // Create subscription
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
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
      success_url: `${process.env.URL}/store?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/store?canceled=true`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutUrl: session.url })
    };
  } catch (error) {
    console.error('Subscription error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create subscription' })
    };
  }
}

async function handlePurchase({ item, price, steamId }) {
  try {
    // Create or retrieve customer
    const customer = await getOrCreateCustomer(steamId);

    // Create one-time purchase session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
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
      success_url: `${process.env.URL}/store?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/store?canceled=true`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutUrl: session.url })
    };
  } catch (error) {
    console.error('Purchase error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process purchase' })
    };
  }
}

async function handleDonation({ amount, steamId }) {
  try {
    // Create or retrieve customer
    const customer = await getOrCreateCustomer(steamId);

    // Create donation session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
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
      success_url: `${process.env.URL}/store?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/store?canceled=true`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutUrl: session.url })
    };
  } catch (error) {
    console.error('Donation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process donation' })
    };
  }
}

async function getOrCreateCustomer(steamId) {
  try {
    // Search for existing customer
    const customers = await stripe.customers.list({
      limit: 1,
      query: `metadata['steamId']:'${steamId}'`
    });

    if (customers.data.length > 0) {
      return customers.data[0];
    }

    // Create new customer
    return await stripe.customers.create({
      metadata: {
        steamId: steamId
      }
    });
  } catch (error) {
    console.error('Customer error:', error);
    throw new Error('Failed to get or create customer');
  }
} 