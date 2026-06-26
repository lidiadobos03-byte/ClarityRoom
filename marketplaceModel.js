export const clientCreditPackages = [
  {
    id: 'client-essential',
    name: 'Essential Clarity',
    price: '£45',
    credits: 50,
    features: ['Ideal for 1 deep venting session', 'Secure WebRTC audio/video', 'Anonymous match to vetted guide'],
    summary: 'A premium starter bundle for stressed professionals who want to test the platform with a single secure session.',
  },
  {
    id: 'client-professional',
    name: 'Professional Growth',
    price: '£160',
    credits: 200,
    features: ['Equivalent to 4 structured sessions', 'Save £20 on retail value', 'Priority guide matching'],
    summary: 'A mid-tier package for regular executives, offering both savings and faster access to top guides.',
  },
  {
    id: 'client-executive',
    name: 'Executive Space',
    price: '£360',
    credits: 500,
    features: ['10 full sessions included', 'Dedicated account dashboard', 'Direct calendar integrations'],
    summary: 'The high-value executive tier designed for longer-term well-being support and continuous burnout management.',
  },
];

export const guideCreditPackages = [
  {
    id: 'guide-starter',
    name: 'Starter Earner',
    price: '£5',
    credits: 50,
    features: ['Apply to ~10 open executive requests', 'Keep 80% of your hourly session rate', 'Build first UK trust profile'],
    summary: 'An entry package for guides to unlock their first corporate requests while keeping fees low.',
  },
  {
    id: 'guide-pro-companion',
    name: 'Pro Companion',
    price: '£12',
    credits: 150,
    features: ['Apply to multiple active leads', 'Includes 24h profile boost feature', 'Higher visibility for fast matches'],
    summary: 'A growth package for verified guides ready to scale with better sourcing and profile promotion.',
  },
  {
    id: 'guide-top-earner',
    name: 'Top Earner Pack',
    price: '£25',
    credits: 400,
    features: ['Designed for full-time autonomy', 'Priority access to high-budget clients', 'Lower transaction overhead per request'],
    summary: 'A large package for guides committed to a steady pipeline of premium, anonymous client sessions.',
  },
];

export const platformSteps = [
  {
    step: '1',
    title: 'Anonymous onboarding',
    description: 'Clients register with a secure alias; guides verify UK DBS checks and credentials via a separate background process.',
  },
  {
    step: '2',
    title: 'Dual credit purchase',
    description: 'Clients buy premium session minutes while guides purchase low-cost unlock credits to bid on assignments.',
  },
  {
    step: '3',
    title: 'Discreet matching',
    description: 'The platform pairs clients to verified guides using anonymised profiles and privacy-first meeting rooms.',
  },
  {
    step: '4',
    title: 'Secure session & payout',
    description: 'Sessions are logged securely, payments settle through Stripe Connect, and guides receive automated PFA-compatible payouts.',
  },
];

export const marketplaceArchitecture = [
  {
    title: 'Dual-credit economy',
    description: 'A premium client credit model funds secure minute-based sessions while low-cost guide credits unlock requests and profile visibility.',
  },
  {
    title: 'Verified trust path',
    description: 'Guides are onboarded through UK-safe identity and DBS checks; clients remain anonymous and focus purely on wellbeing support.',
  },
  {
    title: 'Compliant automation',
    description: 'Stripe Connect, anonymised session flow, and role-based account layers create a marketplace that respects UK regulation and PFA-style contractor payouts.',
  },
];

export const platformRoles = [
  {
    title: 'Client',
    description: 'Stress professionals buying minutes for private guidance sessions and maintaining full anonymity from the guide until matching.',
  },
  {
    title: 'Guide',
    description: 'Verified peers with HR/psychology backgrounds who use low-cost unlock credits to access exclusive corporate requests.',
  },
  {
    title: 'Platform',
    description: 'Manages the match, payment routing, compliance checks, session security, and credit ledger between both sides.',
  },
];
