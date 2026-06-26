import crypto from 'node:crypto';
import path from 'node:path';
import express from 'express';
import { config } from './config.js';
import { db, publicUser } from './db.js';
import { hashPassword, requireAuth, signToken, verifyPassword } from './auth.js';
import { findPackage, packages } from './packages.js';
import { createV2GuideAccount, requireStripe, stripe } from './stripe.js';

const app = express();

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; img-src 'self' data:; connect-src 'self'",
  });
  next();
});

function grantCheckoutCredits(session, eventId, eventType = 'checkout_paid') {
  if (session.payment_status !== 'paid') return false;
  const userId = session.metadata?.user_id;
  const packageId = session.metadata?.package_id;
  const selected = findPackage(packageId);
  if (!userId || !selected || String(selected.credits) !== session.metadata?.credits) {
    throw new Error('Checkout metadata validation failed.');
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    const alreadyProcessed = db.prepare('SELECT 1 FROM stripe_events WHERE event_id = ?').get(eventId);
    if (alreadyProcessed) {
      db.exec('ROLLBACK');
      return false;
    }
    db.prepare(`
      INSERT OR IGNORE INTO ledger_entries (id, user_id, amount, reason, reference_type, reference_id)
      VALUES (?, ?, ?, ?, 'stripe_checkout', ?)
    `).run(crypto.randomUUID(), userId, selected.credits, `Purchased ${selected.name}`, session.id);
    db.prepare('INSERT INTO stripe_events (event_id, event_type) VALUES (?, ?)').run(eventId, eventType);
    db.exec('COMMIT');
    return true;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe || !config.stripeWebhookSecret) return res.status(503).send('Stripe webhook is not configured.');
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], config.stripeWebhookSecret);
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      grantCheckoutCredits(event.data.object, event.id);
    }
    return res.json({ received: true });
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }
});

app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (req, res) => res.json({ ok: true, paymentsEnabled: Boolean(stripe) }));
app.get('/api/packages', (req, res) => res.json({ packages }));

app.post('/api/auth/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const alias = String(req.body.alias || '').trim();
  const role = req.body.role;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 10) return res.status(400).json({ error: 'Use at least 10 characters for the password.' });
  if (alias.length < 2 || alias.length > 40) return res.status(400).json({ error: 'Alias must contain between 2 and 40 characters.' });
  if (!['client', 'guide'].includes(role)) return res.status(400).json({ error: 'Choose client or guide.' });

  const user = { id: crypto.randomUUID(), email, passwordHash: await hashPassword(password), role, alias };
  try {
    db.prepare('INSERT INTO users (id, email, password_hash, role, alias) VALUES (?, ?, ?, ?, ?)')
      .run(user.id, user.email, user.passwordHash, user.role, user.alias);
  } catch (error) {
    if (String(error.message).includes('UNIQUE')) return res.status(409).json({ error: 'An account already uses this email.' });
    throw error;
  }
  const saved = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  db.prepare(`
    INSERT INTO ledger_entries (id, user_id, amount, reason, reference_type, reference_id)
    VALUES (?, ?, ?, 'Founding member welcome credits', 'welcome_grant', ?)
  `).run(crypto.randomUUID(), user.id, 30, user.id);
  return res.status(201).json({ token: signToken(user.id), user: publicUser(saved) });
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !(await verifyPassword(String(req.body.password || ''), user.password_hash))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' });
  }
  return res.json({ token: signToken(user.id), user: publicUser(user) });
});

app.get('/api/me', requireAuth(db), (req, res) => res.json({ user: publicUser(req.user) }));

app.post('/api/checkout-sessions', requireAuth(db), requireStripe, async (req, res, next) => {
  try {
    const selected = findPackage(req.body.packageId);
    if (!selected || selected.role !== req.user.role) return res.status(400).json({ error: 'That package is not available for this account.' });
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey || String(idempotencyKey).length > 100) return res.status(400).json({ error: 'A valid idempotency key is required.' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${config.appUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.appUrl}/?checkout=cancelled`,
      customer_email: req.user.email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'gbp',
          unit_amount: selected.pricePence,
          product_data: {
            name: selected.name,
            description: `${selected.credits} non-transferable ClarityRoom ${selected.role} credits`,
          },
        },
      }],
      metadata: {
        user_id: req.user.id,
        package_id: selected.id,
        credits: String(selected.credits),
        role: selected.role,
      },
    }, { idempotencyKey: String(idempotencyKey) });
    return res.status(201).json({ url: session.url });
  } catch (error) {
    next(error);
  }
});

app.get('/api/checkout-sessions/:id/confirm', requireAuth(db), requireStripe, async (req, res, next) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);
    if (session.metadata?.user_id !== req.user.id) return res.status(404).json({ error: 'Checkout session not found.' });
    const granted = grantCheckoutCredits(session, `checkout_session:${session.id}`, 'checkout_confirmed');
    return res.json({ paid: session.payment_status === 'paid', granted, user: publicUser(req.user) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/connect/onboarding', requireAuth(db, 'guide'), requireStripe, async (req, res, next) => {
  try {
    let accountId = req.user.stripe_account_id;
    if (!accountId) {
      const account = await createV2GuideAccount(req.user);
      accountId = account.id;
      db.prepare('UPDATE users SET stripe_account_id = ? WHERE id = ?').run(accountId, req.user.id);
    }
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${config.appUrl}/?connect=refresh`,
      return_url: `${config.appUrl}/?connect=returned`,
      type: 'account_onboarding',
    });
    return res.json({ url: link.url });
  } catch (error) {
    next(error);
  }
});

app.post('/api/requests', requireAuth(db, 'client'), (req, res) => {
  const topic = String(req.body.topic || '').trim();
  const summary = String(req.body.summary || '').trim();
  const category = String(req.body.category || 'Work pressure').trim();
  const preferredTime = String(req.body.preferredTime || 'Flexible').trim();
  const durationMinutes = Number(req.body.durationMinutes || 50);
  if (topic.length < 3 || topic.length > 80 || summary.length < 20 || summary.length > 800) {
    return res.status(400).json({ error: 'Provide a short topic and a summary between 20 and 800 characters.' });
  }
  if (!['Work pressure', 'Burnout', 'Career transition', 'Leadership', 'Other'].includes(category)) {
    return res.status(400).json({ error: 'Choose a valid conversation category.' });
  }
  if (![30, 50, 75].includes(durationMinutes)) {
    return res.status(400).json({ error: 'Choose a supported session length.' });
  }
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO requests (id, client_id, topic, summary, category, preferred_time, duration_minutes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, topic, summary, category, preferredTime, durationMinutes);
  return res.status(201).json({ id, topic, category, preferredTime, durationMinutes, status: 'open' });
});

app.get('/api/requests', requireAuth(db, 'guide'), (req, res) => {
  const rows = db.prepare(`
    SELECT r.id, r.topic, r.summary, r.category, r.preferred_time, r.duration_minutes, r.status, r.created_at,
      EXISTS(SELECT 1 FROM request_unlocks u WHERE u.request_id = r.id AND u.guide_id = ?) AS unlocked
    FROM requests r WHERE r.status IN ('open', 'matched') ORDER BY r.created_at DESC
  `).all(req.user.id);
  return res.json({
    requests: rows.map(row => ({ ...row, summary: row.unlocked ? row.summary : 'Unlock to view the private brief.' })),
  });
});

app.post('/api/requests/:id/unlock', requireAuth(db, 'guide'), (req, res) => {
  const cost = 5;
  const message = String(req.body.message || '').trim();
  if (message.length < 10 || message.length > 300) {
    return res.status(400).json({ error: 'Write a short introduction between 10 and 300 characters.' });
  }
  db.exec('BEGIN IMMEDIATE');
  try {
    const request = db.prepare("SELECT * FROM requests WHERE id = ? AND status = 'open'").get(req.params.id);
    if (!request) throw Object.assign(new Error('Request is no longer available.'), { status: 404 });
    const existing = db.prepare('SELECT 1 FROM request_unlocks WHERE request_id = ? AND guide_id = ?').get(req.params.id, req.user.id);
    if (existing) {
      db.exec('ROLLBACK');
      return res.json({ unlocked: true, summary: request.summary, balance: publicUser(req.user).balance });
    }
    if (publicUser(req.user).balance < cost) throw Object.assign(new Error('Not enough guide credits.'), { status: 409 });
    const unlockId = crypto.randomUUID();
    db.prepare('INSERT INTO request_unlocks (id, request_id, guide_id, message) VALUES (?, ?, ?, ?)')
      .run(unlockId, req.params.id, req.user.id, message);
    db.prepare(`
      INSERT INTO ledger_entries (id, user_id, amount, reason, reference_type, reference_id)
      VALUES (?, ?, ?, 'Unlocked private request', 'request_unlock', ?)
    `).run(crypto.randomUUID(), req.user.id, -cost, unlockId);
    db.exec('COMMIT');
    return res.json({ unlocked: true, summary: request.summary, balance: publicUser(req.user).balance });
  } catch (error) {
    db.exec('ROLLBACK');
    return res.status(error.status || 400).json({ error: error.message });
  }
});

app.get('/api/client/requests', requireAuth(db, 'client'), (req, res) => {
  const requests = db.prepare(`
    SELECT r.*, COUNT(u.id) AS interest_count
    FROM requests r
    LEFT JOIN request_unlocks u ON u.request_id = r.id
    WHERE r.client_id = ?
    GROUP BY r.id
    ORDER BY r.created_at DESC
  `).all(req.user.id);

  const interests = db.prepare(`
    SELECT u.id, u.request_id, u.message, u.status, u.created_at, g.alias AS guide_alias
    FROM request_unlocks u
    JOIN users g ON g.id = u.guide_id
    JOIN requests r ON r.id = u.request_id
    WHERE r.client_id = ?
    ORDER BY u.created_at DESC
  `).all(req.user.id);

  return res.json({
    requests: requests.map(request => ({
      ...request,
      interests: interests.filter(item => item.request_id === request.id),
    })),
  });
});

app.post('/api/requests/:id/select-guide', requireAuth(db, 'client'), (req, res) => {
  const unlockId = String(req.body.unlockId || '');
  db.exec('BEGIN IMMEDIATE');
  try {
    const request = db.prepare("SELECT * FROM requests WHERE id = ? AND client_id = ? AND status = 'open'")
      .get(req.params.id, req.user.id);
    if (!request) throw Object.assign(new Error('This request is no longer available for matching.'), { status: 404 });
    const interest = db.prepare('SELECT * FROM request_unlocks WHERE id = ? AND request_id = ?').get(unlockId, request.id);
    if (!interest) throw Object.assign(new Error('Guide interest not found.'), { status: 404 });

    db.prepare("UPDATE requests SET status = 'matched' WHERE id = ?").run(request.id);
    db.prepare("UPDATE request_unlocks SET status = 'not_selected' WHERE request_id = ?").run(request.id);
    db.prepare("UPDATE request_unlocks SET status = 'selected' WHERE id = ?").run(interest.id);
    const sessionId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO sessions (id, request_id, client_id, guide_id, scheduled_for, duration_minutes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(sessionId, request.id, req.user.id, interest.guide_id, request.preferred_time, request.duration_minutes);
    db.exec('COMMIT');
    return res.status(201).json({ sessionId, status: 'scheduled' });
  } catch (error) {
    db.exec('ROLLBACK');
    return res.status(error.status || 400).json({ error: error.message });
  }
});

app.get('/api/sessions', requireAuth(db), (req, res) => {
  const isClient = req.user.role === 'client';
  const rows = db.prepare(`
    SELECT s.*, r.topic, r.category,
      client.alias AS client_alias,
      guide.alias AS guide_alias
    FROM sessions s
    JOIN requests r ON r.id = s.request_id
    JOIN users client ON client.id = s.client_id
    JOIN users guide ON guide.id = s.guide_id
    WHERE s.${isClient ? 'client_id' : 'guide_id'} = ?
    ORDER BY s.created_at DESC
  `).all(req.user.id);
  return res.json({ sessions: rows });
});

function sessionForParticipant(sessionId, userId) {
  return db.prepare(`
    SELECT s.*, r.topic, r.category,
      client.alias AS client_alias,
      guide.alias AS guide_alias
    FROM sessions s
    JOIN requests r ON r.id = s.request_id
    JOIN users client ON client.id = s.client_id
    JOIN users guide ON guide.id = s.guide_id
    WHERE s.id = ? AND (s.client_id = ? OR s.guide_id = ?)
  `).get(sessionId, userId, userId);
}

app.get('/api/sessions/:id/messages', requireAuth(db), (req, res) => {
  const session = sessionForParticipant(req.params.id, req.user.id);
  if (!session) return res.status(404).json({ error: 'Private session not found.' });

  const messages = db.prepare(`
    SELECT m.id, m.body, m.created_at, m.sender_id,
      sender.alias AS sender_alias,
      sender.role AS sender_role
    FROM session_messages m
    JOIN users sender ON sender.id = m.sender_id
    WHERE m.session_id = ?
    ORDER BY m.created_at ASC, m.rowid ASC
  `).all(session.id);

  db.prepare(`
    INSERT INTO session_message_reads (session_id, user_id, last_read_at, last_read_rowid)
    VALUES (?, ?, CURRENT_TIMESTAMP, COALESCE((SELECT MAX(rowid) FROM session_messages WHERE session_id = ?), 0))
    ON CONFLICT(session_id, user_id)
    DO UPDATE SET
      last_read_at = CURRENT_TIMESTAMP,
      last_read_rowid = COALESCE((SELECT MAX(rowid) FROM session_messages WHERE session_id = ?), 0)
  `).run(session.id, req.user.id, session.id, session.id);

  return res.json({ session, messages });
});

app.post('/api/sessions/:id/messages', requireAuth(db), (req, res) => {
  const session = sessionForParticipant(req.params.id, req.user.id);
  if (!session) return res.status(404).json({ error: 'Private session not found.' });
  const body = String(req.body.body || '').trim();
  if (body.length < 1 || body.length > 2000) {
    return res.status(400).json({ error: 'Messages must contain between 1 and 2000 characters.' });
  }

  const id = crypto.randomUUID();
  db.prepare('INSERT INTO session_messages (id, session_id, sender_id, body) VALUES (?, ?, ?, ?)')
    .run(id, session.id, req.user.id, body);
  const message = db.prepare(`
    SELECT m.id, m.body, m.created_at, m.sender_id,
      sender.alias AS sender_alias,
      sender.role AS sender_role
    FROM session_messages m
    JOIN users sender ON sender.id = m.sender_id
    WHERE m.id = ?
  `).get(id);
  return res.status(201).json({ message });
});

app.get('/api/notifications', requireAuth(db), (req, res) => {
  const notifications = db.prepare(`
    SELECT
      s.id AS session_id,
      r.topic,
      CASE WHEN s.client_id = ? THEN guide.alias ELSE client.alias END AS sender_alias,
      COUNT(m.id) AS unread_count,
      MAX(m.created_at) AS latest_at,
      (
        SELECT latest.body
        FROM session_messages latest
        WHERE latest.session_id = s.id AND latest.sender_id != ?
        ORDER BY latest.created_at DESC, latest.rowid DESC
        LIMIT 1
      ) AS latest_message
    FROM sessions s
    JOIN requests r ON r.id = s.request_id
    JOIN users client ON client.id = s.client_id
    JOIN users guide ON guide.id = s.guide_id
    JOIN session_messages m ON m.session_id = s.id AND m.sender_id != ?
    LEFT JOIN session_message_reads reads ON reads.session_id = s.id AND reads.user_id = ?
    WHERE (s.client_id = ? OR s.guide_id = ?)
      AND m.rowid > COALESCE(reads.last_read_rowid, 0)
    GROUP BY s.id
    ORDER BY latest_at DESC
  `).all(req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id);

  return res.json({
    unreadCount: notifications.reduce((sum, item) => sum + item.unread_count, 0),
    notifications,
  });
});

if (config.isProduction) {
  const dist = path.resolve('dist');
  app.use(express.static(dist));
  app.get('/{*splat}', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: config.isProduction ? 'Unexpected server error.' : error.message });
});

app.listen(config.port, config.host, error => {
  if (error) {
    console.error(`Could not start ClarityRoom API: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`ClarityRoom API listening on http://${config.host}:${config.port}`);
});
