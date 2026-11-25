import React from 'react';

export const SanctuarySection: React.FC = () => {
  return (
    <section id="sanctuary" className="py-24 border-b border-hairline bg-linen/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 space-y-8">
            <span className="text-xs tracking-widest uppercase text-champagne font-semibold block">
              The Sanctuary Code
            </span>

            <h2 className="text-3xl sm:text-4xl font-serif text-espresso leading-snug font-light italic">
              &ldquo;Hair is an organic silhouette. It should never be forced or compromised by haste.&rdquo;
            </h2>

            <div className="space-y-2 pt-2">
              <svg
                className="h-12 text-champagne w-48 opacity-85"
                viewBox="0 0 200 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 40 C 20 10, 40 10, 50 35 C 55 45, 60 50, 70 30 C 80 10, 95 20, 110 35 C 120 45, 135 15, 150 25 C 165 35, 180 20, 190 30" />
              </svg>
              <p className="text-xs uppercase tracking-widest text-espresso font-medium">
                Solène Moreau
              </p>
              <p className="text-[11px] text-taupe uppercase tracking-wider">
                Founder &amp; Creative Director
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-10">
            <p className="text-base sm:text-lg text-taupe font-light leading-relaxed max-w-2xl">
              Inside Maison Solène, we rejected the noisy chaos of traditional salons. We designed a
              tranquil sanctuary built around private single-client suites, bespoke plant-based
              chemistry, and deep quiet.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-6 border-t border-hairline">
              <div className="space-y-3">
                <span className="text-xs text-champagne font-serif italic">01.</span>
                <h3 className="text-sm uppercase tracking-widest text-espresso font-medium">
                  Unhurried Appointments
                </h3>
                <p className="text-xs text-taupe leading-relaxed">
                  We schedule generous turnover buffers so your stylist’s focus is entirely yours.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-xs text-champagne font-serif italic">02.</span>
                <h3 className="text-sm uppercase tracking-widest text-espresso font-medium">
                  Botanical Alchemy
                </h3>
                <p className="text-xs text-taupe leading-relaxed">
                  Cold-pressed organic oils, fermented tea rinses, and zero synthetic fragrance.
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-xs text-champagne font-serif italic">03.</span>
                <h3 className="text-sm uppercase tracking-widest text-espresso font-medium">
                  Bespoke Silhouette
                </h3>
                <p className="text-xs text-taupe leading-relaxed">
                  Precision dry-sculpting tailored to your face geometry and natural hair movement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
