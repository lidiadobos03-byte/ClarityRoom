export const payoutPolicy = {
  currency: 'gbp',
  platformFeePercent: 20,
  ratesByDuration: {
    30: 2500,
    50: 4000,
    75: 6000,
  },
};

export function quoteSessionEarnings(durationMinutes) {
  const clientPricePence = payoutPolicy.ratesByDuration[durationMinutes] || payoutPolicy.ratesByDuration[50];
  const platformFeePence = Math.round(clientPricePence * payoutPolicy.platformFeePercent / 100);
  return {
    clientPricePence,
    platformFeePence,
    guideEarningsPence: clientPricePence - platformFeePence,
  };
}

export function sumEarningsByStatus(rows) {
  return rows.reduce((summary, row) => {
    if (row.status === 'pending') summary.pendingPence += row.amount_pence;
    if (row.status === 'available') summary.availablePence += row.amount_pence;
    if (row.status === 'paid') summary.paidPence += row.amount_pence;
    return summary;
  }, { pendingPence: 0, availablePence: 0, paidPence: 0 });
}
