import path from 'node:path';

export const config = {
  port: Number(process.env.PORT || 8787),
  host: process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1'),
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  databasePath: path.resolve(process.env.DATABASE_PATH || './data/clarityroom.sqlite'),
  authSecret: process.env.AUTH_SECRET || 'development-only-change-this-secret-now',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripeApiVersion: process.env.STRIPE_API_VERSION || '2026-02-25.clover',
  allowLiveStripe: process.env.ALLOW_LIVE_STRIPE === 'true',
  enableGuidePayouts: process.env.ENABLE_GUIDE_PAYOUTS === 'true',
  isProduction: process.env.NODE_ENV === 'production',
};

config.stripeEnabled = Boolean(
  config.stripeSecretKey
  && (!config.stripeSecretKey.startsWith('sk_live_') || (config.isProduction && config.allowLiveStripe)),
);

config.guidePayoutsEnabled = Boolean(config.stripeEnabled && config.enableGuidePayouts);

if (
  config.isProduction
  && (
    config.authSecret === 'development-only-change-this-secret-now'
    || config.authSecret === 'replace-with-at-least-32-random-characters'
    || config.authSecret.length < 32
  )
) {
  throw new Error('AUTH_SECRET must contain at least 32 random characters in production.');
}
