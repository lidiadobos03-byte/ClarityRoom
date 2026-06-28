import assert from 'node:assert/strict';
import test from 'node:test';
import { payoutPolicy, quoteSessionEarnings, sumEarningsByStatus } from '../server/earnings.js';

test('session earnings keep guide share separate from platform fee', () => {
  const quote = quoteSessionEarnings(50);
  assert.equal(quote.clientPricePence, payoutPolicy.ratesByDuration[50]);
  assert.equal(quote.platformFeePence, 800);
  assert.equal(quote.guideEarningsPence, 3200);
});

test('earning ledger summary groups money by payout status', () => {
  const summary = sumEarningsByStatus([
    { status: 'pending', amount_pence: 1200 },
    { status: 'available', amount_pence: 2000 },
    { status: 'paid', amount_pence: 3200 },
    { status: 'cancelled', amount_pence: 900 },
  ]);

  assert.deepEqual(summary, {
    pendingPence: 1200,
    availablePence: 2000,
    paidPence: 3200,
  });
});
