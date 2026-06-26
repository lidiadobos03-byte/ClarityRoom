import React, { useEffect, useState } from 'react';
import {
  clientCreditPackages,
  guideCreditPackages,
  marketplaceArchitecture,
  platformRoles,
  platformSteps,
} from './marketplaceModel';

export default function ClarityRoomLanding() {
  const [isClientView, setIsClientView] = useState(true);
  const [selectedPackageId, setSelectedPackageId] = useState('client-professional');

  const packageList = isClientView ? clientCreditPackages : guideCreditPackages;
  const selectedPackage = packageList.find(pkg => pkg.id === selectedPackageId) ?? packageList[0];

  useEffect(() => {
    setSelectedPackageId(isClientView ? 'client-professional' : 'guide-pro-companion');
  }, [isClientView]);

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#1A2421] font-sans selection:bg-[#C5A880]/30 antialiased">
      {/* 1. NAVIGATION BAR */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-[#1A2421]/5">
        <div className="text-xl font-serif tracking-tight font-semibold">
          Clarity<span className="text-[#C5A880]">Room</span>
        </div>
        <div className="flex items-center gap-8 text-sm tracking-wide font-medium">
          <button
            onClick={() => setIsClientView(true)}
            className={`transition-colors ${isClientView ? 'text-[#1A2421] border-b border-[#1A2421]' : 'text-[#1A2421]/60 hover:text-[#1A2421]'}`}
          >
            Find Clarity
          </button>
          <button
            onClick={() => setIsClientView(false)}
            className={`transition-colors ${!isClientView ? 'text-[#1A2421] border-b border-[#1A2421]' : 'text-[#1A2421]/60 hover:text-[#1A2421]'}`}
          >
            Become a Guide
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-4xl md:text-6xl font-serif tracking-tight leading-[1.15] mb-6">
          The corporate world is loud.<br />
          <span className="italic text-[#C5A880]">Find your clarity here.</span>
        </h1>
        <p className="text-base md:text-lg text-[#1A2421]/70 font-light max-w-2xl mx-auto leading-relaxed mb-10">
          Anonymous, premium, on-demand sessions for professionals. Speak with vetted guides who understand executive stress, burnout, and career transitions. No judgment. Just a discreet space to process.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-[#1A2421] text-[#FBFBFA] text-sm font-medium tracking-wide px-8 py-4 rounded-none hover:bg-[#1A2421]/90 transition-all shadow-sm">
            Book an Anonymous Session
          </button>
          <button className="border border-[#1A2421]/20 text-[#1A2421] text-sm font-medium tracking-wide px-8 py-4 rounded-none hover:bg-[#1A2421]/5 transition-all">
            Join as a Vetted Guide
          </button>
        </div>
      </header>

      {/* 3. SAFETY & TRUST STANDARDS */}
      <section className="bg-[#1A2421]/5 border-y border-[#1A2421]/5 py-8 my-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase mb-1">100% Anonymous</h4>
            <p className="text-xs text-[#1A2421]/60">No corporate tracking or ID exposed to guides.</p>
          </div>
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase mb-1">Vetted Peers Only</h4>
            <p className="text-xs text-[#1A2421]/60">All guides hold valid UK DBS checks & verified identities.</p>
          </div>
          <div>
            <h4 className="text-sm font-medium tracking-wider uppercase mb-1">Strictly Platonic</h4>
            <p className="text-xs text-[#1A2421]/60">A safe, professional space governed by mutual respect.</p>
          </div>
        </div>
      </section>

      {/* 4. THE FOUR PILLARS */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <span className="text-xs tracking-widest uppercase text-[#C5A880] font-semibold">Our Specialisations</span>
          <h2 className="text-3xl font-serif tracking-tight mt-2">Tailored for Executive Challenges</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { num: '01', title: 'Burnout Management', desc: 'When the pressure builds up and you need to safely recalibrate before hitting the wall.' },
            { num: '02', title: 'Executive Stress', desc: 'A secure sounding board for leaders facing high-stakes decisions and isolation.' },
            { num: '03', title: 'Career Transition', desc: 'Active partnership and strategic listening when you are standing at a corporate crossroads.' },
            { num: '04', title: 'Active Listening', desc: 'A dedicated, sharp mind to help you think out loud without corporate politics interference.' },
          ].map((pillar, i) => (
            <div key={i} className="p-8 border border-[#1A2421]/5 bg-white shadow-sm flex flex-col justify-between hover:border-[#C5A880]/40 transition-colors">
              <div>
                <span className="block text-xs font-serif text-[#C5A880] mb-4">{pillar.num}</span>
                <h3 className="text-lg font-serif tracking-tight mb-3">{pillar.title}</h3>
                <p className="text-sm text-[#1A2421]/70 font-light leading-relaxed">{pillar.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-[#FEFCF5] border border-[#1A2421]/10 mb-24">
        <div className="text-center mb-12">
          <span className="text-xs tracking-widest uppercase text-[#C5A880] font-semibold">How ClarityRoom Works</span>
          <h2 className="text-3xl font-serif tracking-tight mt-2">One discreet process, four clear stages</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {platformSteps.map((step, index) => (
            <div key={index} className="p-8 bg-white border border-[#1A2421]/10 shadow-sm text-center">
              <div className="text-xs font-serif text-[#C5A880] mb-3">Step {step.step}</div>
              <h3 className="text-xl font-serif tracking-tight mb-3">{step.title}</h3>
              <p className="text-sm text-[#1A2421]/70 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CREDIT PACKAGES (DYNAMICAL VIEW BASED ON ROLE) */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-white border border-[#1A2421]/5 mb-24 shadow-sm">
        <div className="text-center mb-12">
          <span className="text-xs tracking-widest uppercase text-[#C5A880] font-semibold">Transparent Pricing</span>
          <h2 className="text-3xl font-serif tracking-tight mt-2">
            {isClientView ? 'Secure Your Clarity Credits' : 'Access Premium Corporate Leads'}
          </h2>
          <p className="text-sm text-[#1A2421]/60 mt-2 max-w-md mx-auto">
            {isClientView
              ? 'Credits never expire. Use them on-demand for secure sessions and premium guide matching.'
              : 'Low-cost entry credits for verified guides. Apply to requests, boost your profile, and scale your earnings.'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8 mb-10">
          <button
            onClick={() => setIsClientView(true)}
            className={`w-full lg:w-auto px-6 py-4 text-sm uppercase tracking-widest border ${isClientView ? 'border-[#C5A880] bg-[#FBFBFA]' : 'border-[#1A2421]/20 bg-white'} hover:bg-[#FBFBFA] transition-all`}
          >
            Client credits
          </button>
          <button
            onClick={() => setIsClientView(false)}
            className={`w-full lg:w-auto px-6 py-4 text-sm uppercase tracking-widest border ${!isClientView ? 'border-[#C5A880] bg-[#FBFBFA]' : 'border-[#1A2421]/20 bg-white'} hover:bg-[#FBFBFA] transition-all`}
          >
            Guide unlocks
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {packageList.map(pkg => (
            <div key={pkg.id} className={`p-8 flex flex-col justify-between text-center transition-all ${selectedPackageId === pkg.id ? 'border-2 border-[#C5A880] bg-[#FBFBFA]' : 'border border-[#1A2421]/10 bg-white hover:border-[#C5A880]/40'}`}>
              <div>
                <h3 className="text-base font-medium tracking-wide mb-2">{pkg.name}</h3>
                <div className="text-3xl font-serif my-4">{pkg.price}</div>
                <p className="text-xs text-[#1A2421]/60 mb-6">Includes {pkg.credits} Credits</p>
                <div className="border-t border-[#1A2421]/5 pt-4 text-sm text-[#1A2421]/70 font-light space-y-2">
                  {pkg.features.map((feature, idx) => (
                    <p key={idx}>{feature}</p>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedPackageId(pkg.id)}
                className={`mt-8 w-full py-3 text-xs tracking-wider uppercase font-medium transition-all ${selectedPackageId === pkg.id ? 'bg-[#1A2421] text-[#FBFBFA]' : 'border border-[#1A2421] hover:bg-[#1A2421] hover:text-[#FBFBFA]'}`}
              >
                {selectedPackageId === pkg.id ? 'Selected' : 'Select package'}
              </button>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-12 p-8 border border-[#1A2421]/10 bg-[#FEFCF5] shadow-sm">
          <h3 className="text-xl font-serif tracking-tight mb-3">Current plan focus</h3>
          <p className="text-sm text-[#1A2421]/70 leading-relaxed">
            {selectedPackage.summary}
          </p>
        </div>
      </section>

      {/* 7. MARKETPLACE ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-6 py-20 bg-[#F7F5F0] border border-[#1A2421]/10 mb-24">
        <div className="text-center mb-12">
          <span className="text-xs tracking-widest uppercase text-[#C5A880] font-semibold">Platform Design</span>
          <h2 className="text-3xl font-serif tracking-tight mt-2">Marketplace architecture for anonymous, compliant trust</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {marketplaceArchitecture.map((card, idx) => (
            <div key={idx} className="p-8 bg-white border border-[#1A2421]/10 shadow-sm">
              <h3 className="text-xl font-serif tracking-tight mb-3">{card.title}</h3>
              <p className="text-sm text-[#1A2421]/70 leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {platformRoles.map((role, idx) => (
            <div key={idx} className="p-8 bg-white border border-[#1A2421]/10 shadow-sm">
              <h4 className="text-xs tracking-widest uppercase text-[#C5A880] font-semibold mb-2">{role.title}</h4>
              <p className="text-sm text-[#1A2421]/70 leading-relaxed">{role.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-8 text-xs text-[#1A2421]/40 border-t border-[#1A2421]/5">
        &copy; {new Date().getFullYear()} ClarityRoom UK. All rights reserved. Strictly platonic companion services.
      </footer>
    </div>
  );
}
