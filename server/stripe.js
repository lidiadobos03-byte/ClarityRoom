import Stripe from 'stripe';
import { config } from './config.js';

export const stripe = config.stripeEnabled
  ? new Stripe(config.stripeSecretKey, { apiVersion: config.stripeApiVersion })
  : null;

export function requireStripe(req, res, next) {
  if (!stripe) {
    return res.status(503).json({ error: 'Payments are currently paused while the platform preview is being developed.' });
  }
  next();
}

export async function createV2GuideAccount(user) {
  const response = await fetch('https://api.stripe.com/v2/core/accounts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.stripeSecretKey}`,
      'Content-Type': 'application/json',
      'Stripe-Version': config.stripeApiVersion,
    },
    body: JSON.stringify({
      contact_email: user.email,
      display_name: user.alias,
      dashboard: 'full',
      identity: {
        country: 'gb',
        entity_type: 'individual',
      },
      configuration: {
        recipient: {
          capabilities: {
            stripe_balance: {
              stripe_transfers: { requested: true },
            },
          },
        },
      },
      defaults: {
        currency: 'gbp',
        locales: ['en-GB'],
        responsibilities: {
          fees_collector: 'stripe',
          losses_collector: 'stripe',
        },
      },
      include: ['configuration.recipient', 'identity', 'requirements'],
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || 'Could not create the Stripe connected account.');
  return payload;
}
