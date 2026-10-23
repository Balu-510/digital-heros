import Stripe from 'stripe';
import User from '../user/user.model.js';

let stripeInstance;
const getStripe = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

const getConfiguredPrice = (plan) =>
  plan === 'yearly' ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;

// Accepts a Price ID (price_...). If a Product ID (prod_...) was configured by mistake,
// look up that product's active recurring price for the requested billing interval.
export const resolvePriceId = async (stripe, configured, plan) => {
  if (!configured) return null;
  if (!configured.startsWith('prod_')) return configured;

  const interval = plan === 'yearly' ? 'year' : 'month';
  const { data } = await stripe.prices.list({
    product: configured,
    active: true,
    type: 'recurring',
    limit: 20,
  });
  const match = data.find((p) => p.recurring?.interval === interval);
  return match ? match.id : null;
};

// POST /api/payments/create-checkout-session
export const createCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripe();
    const plan = req.body.plan === 'yearly' ? 'yearly' : 'monthly';
    const configured = getConfiguredPrice(plan);
    const priceId = await resolvePriceId(stripe, configured, plan);

    if (!priceId) {
      return res.status(500).json({
        message: configured
          ? `No active recurring ${plan === 'yearly' ? 'yearly' : 'monthly'} price found in Stripe for STRIPE_PRICE_${plan.toUpperCase()}.`
          : `STRIPE_PRICE_${plan.toUpperCase()} is not configured.`,
      });
    }

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: req.user.email,
      client_reference_id: req.user._id.toString(),
      metadata: { plan },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${clientUrl}/dashboard?success=true`,
      cancel_url: `${clientUrl}/dashboard?canceled=true`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error.message);
    res.status(500).json({ message: `Checkout failed: ${error.message}` });
  }
};

// POST /api/payments/webhook  (raw body, no auth cookie — verified by Stripe signature)
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const plan = session.metadata?.plan === 'yearly' ? 'yearly' : 'monthly';

      const renewalDate = new Date();
      if (plan === 'yearly') renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      else renewalDate.setMonth(renewalDate.getMonth() + 1);

      const user = await User.findById(session.client_reference_id);
      if (user) {
        user.subscription.status = 'active';
        user.subscription.plan = plan;
        user.subscription.stripeCustomerId = session.customer;
        user.subscription.stripeSubscriptionId = session.subscription;
        user.subscription.renewalDate = renewalDate;
        if (user.role !== 'admin') user.role = 'subscriber';
        await user.save();
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
      if (user) {
        user.subscription.status = 'canceled';
        if (user.role === 'subscriber') user.role = 'public';
        await user.save();
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error.message);
    // 500 makes Stripe retry delivery
    res.status(500).json({ message: 'Webhook handler failed' });
  }
};
