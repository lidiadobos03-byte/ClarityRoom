# ClarityRoom

MVP full-stack pentru un marketplace britanic de sesiuni private, platonice și non-clinice de active listening.

## Ce funcționează

- aplicație React/Vite responsive;
- conturi separate client/guide, cu alias public și parole stocate prin `scrypt`;
- SQLite local și ledger append-only pentru două economii de credite;
- landing page „quiet luxury” și dashboarduri responsive pentru ambele roluri;
- 30 credite de bun venit pentru ambele roluri, pentru testarea completă fără plăți;
- cereri private create de clienți și deblocate tranzacțional de ghizi;
- introduceri ale ghizilor, selecție de către client și creare automată a sesiunii;
- formulări prudente despre pseudonimitate, DBS și caracterul non-clinic.

## Pornire locală

```bash
cp .env.example .env
npm install
npm run dev
```

Web: `http://localhost:5173`
API: `http://localhost:8787`

Toate conturile noi primesc automat 30 credite pentru testarea produsului.

## Stripe în test mode

Integrarea folosește Stripe Checkout pentru cumpărarea pachetelor de credite. În local, plățile pornesc doar cu chei de test:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Cheile Stripe live sunt ignorate local. Pentru live este necesar `NODE_ENV=production` și `ALLOW_LIVE_STRIPE=true`.

Pentru webhook-uri în test mode:

```bash
stripe listen --forward-to localhost:8787/api/stripe/webhook
```

Copiază secretul `whsec_...` rezultat în `STRIPE_WEBHOOK_SECRET`.

După ce modifici `.env`, repornește `npm run dev`. În aplicație, intră în dashboard la `Credits`, alege un pachet și folosește cardurile de test Stripe.

## Earnings și payout-uri pentru ghizi

Creditele de ghid sunt separate de banii câștigați. `Credits` cumpără credite pentru deblocarea oportunităților, iar `Earnings` arată valoarea estimată sau payable pentru sesiuni.

Profilul de payout prin Stripe Connect este închis implicit. Pentru a permite onboarding-ul ghizilor în Stripe, setează explicit:

```bash
ENABLE_GUIDE_PAYOUTS=true
```

Acest flag trebuie folosit doar după ce workflow-ul de payout, comisioanele, refund-urile, anulările și obligațiile fiscale/juridice sunt aprobate.

## Limite înainte de lansare

Acesta nu este încă un serviciu gata de producție. Mai sunt necesare:

- verificare email, resetare parolă, rate limiting distribuit și administrare;
- furnizor și workflow complet pentru identity/DBS, inclusiv diferențele dintre England/Wales, Scotland și Northern Ireland;
- DPIA, privacy notice, termeni, retenție, DSAR/deletion și bazele UK GDPR/Article 9;
- safeguarding, incident response, reporting, crisis signposting și moderare;
- rezervări, sesiuni WebRTC, cronometrare, anulări, refund-uri și dispute;
- contabilitate completă pentru earnings/payouts și revizuire UK privind taxarea ghizilor pentru acces la oportunități;
- decizie juridică și fiscală privind creditele, VAT, statutul contractorilor și entitatea care operează marketplace-ul.

Fișierele vechi `intro.js` și `marketplaceModel.js` sunt păstrate doar ca referință pentru mockup-ul inițial; aplicația activă se află în `src/`.
