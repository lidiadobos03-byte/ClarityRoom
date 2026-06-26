export const packages = {
  client: [
    { id: 'client-essential', name: 'Essential Clarity', pricePence: 4500, credits: 50, description: 'One focused listening session.' },
    { id: 'client-professional', name: 'Professional Growth', pricePence: 16000, credits: 200, description: 'Four structured sessions with priority matching.' },
    { id: 'client-executive', name: 'Executive Space', pricePence: 36000, credits: 500, description: 'Longer-term support for demanding seasons.' },
  ],
  guide: [
    { id: 'guide-starter', name: 'Starter', pricePence: 500, credits: 50, description: 'Unlock up to ten suitable requests.' },
    { id: 'guide-pro', name: 'Professional', pricePence: 1200, credits: 150, description: 'More request unlocks and profile visibility.' },
    { id: 'guide-growth', name: 'Growth', pricePence: 2500, credits: 400, description: 'Lower cost per unlock for active guides.' },
  ],
};

export function findPackage(packageId) {
  return Object.entries(packages).flatMap(([role, list]) => list.map(item => ({ ...item, role })))
    .find(item => item.id === packageId);
}
