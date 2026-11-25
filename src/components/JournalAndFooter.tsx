import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GUEST_REFLECTIONS } from '../data/sanctuaryData';

interface JournalAndFooterProps {
  onOpenBooking: () => void;
}

export const JournalAndFooter: React.FC<JournalAndFooterProps> = ({ onOpenBooking }) => {
  const [policyModal, setPolicyModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <section id="journal" className="py-24 border-b border-hairline bg-linen/40">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs tracking-widest uppercase text-champagne font-semibold block">
              Quiet Reflections
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-espresso font-light italic">
              Notes from the Guest Journal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {GUEST_REFLECTIONS.map((item) => (
              <div
                key={item.id}
                className="bg-alabaster p-8 border border-hairline space-y-4 flex flex-col justify-between"
              >
                <p className="text-sm font-serif italic text-espresso leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="pt-4 border-t border-hairline flex items-center justify-between text-xs gap-2">
                  <span className="font-medium text-espresso uppercase tracking-wider">
                    {item.guestName}
                  </span>
                  <span className="text-[11px] text-taupe uppercase">{item.ritualLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-espresso text-alabaster pt-16 pb-12 border-t border-hairline-dark">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-hairline-dark">
            <div className="md:col-span-5 space-y-4">
              <span className="text-2xl font-serif tracking-widest uppercase text-alabaster block">
                MAISON SOLÈNE
              </span>
              <p className="text-xs text-alabaster/75 max-w-sm leading-relaxed">
                A private hair sanctuary dedicated to botanical organic formulations, unhurried
                appointments, and calm sensory restoration.
              </p>
            </div>

            <div className="md:col-span-4 space-y-2 text-xs text-alabaster/75">
              <p className="uppercase tracking-widest text-champagne-light font-semibold mb-2">
                Sanctuary Address
              </p>
              <p className="text-alabaster">No. 42 Rue de L’Orangerie, Mayfair, London</p>
              <p>Tuesday – Saturday &middot; 09:00 – 19:00</p>
              <p>Sunday &amp; Monday &middot; Closed for Botanicals Formulating</p>
            </div>

            <div className="md:col-span-3 space-y-2 text-xs text-alabaster/75">
              <p className="uppercase tracking-widest text-champagne-light font-semibold mb-2">
                Private Concierge
              </p>
              <p className="text-alabaster tabular-nums">+44 (0) 20 7946 0912</p>
              <p>concierge@maisonsolene.com</p>
              <div className="pt-2 flex items-center gap-4">
                <button
                  type="button"
                  onClick={onOpenBooking}
                  className="text-champagne-light hover:text-alabaster transition-colors uppercase tracking-widest text-[11px] cursor-pointer"
                >
                  Reserve Suite
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-alabaster/70 gap-4">
            <p>&copy; 2026 MAISON SOLÈNE &middot; All Rights Reserved.</p>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setPolicyModal('privacy')}
                className="hover:text-alabaster transition-colors cursor-pointer"
              >
                Privacy Notice
              </button>
              <button
                type="button"
                onClick={() => setPolicyModal('terms')}
                className="hover:text-alabaster transition-colors cursor-pointer"
              >
                Suite Terms
              </button>
            </div>
          </div>
        </div>
      </footer>

      {policyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="policy-modal-title"
        >
          <div
            onClick={() => setPolicyModal(null)}
            className="absolute inset-0 drawer-backdrop"
            aria-hidden="true"
          />
          <div className="relative bg-alabaster border border-hairline p-8 max-w-md w-full space-y-5 z-10">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <h3 id="policy-modal-title" className="text-2xl font-serif text-espresso">
                {policyModal === 'privacy' ? 'Guest Privacy Notice' : 'Private Suite Terms'}
              </h3>
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                aria-label="Close modal"
                className="p-1.5 text-taupe hover:text-espresso cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-taupe leading-relaxed">
              {policyModal === 'privacy'
                ? 'Maison Solène prioritizes guest discretion. All private suite reservations, botanical consultation records, and contact details are kept strictly confidential and never shared externally.'
                : 'Each reservation locks your artisan’s private suite for the full ritual duration plus a dedicated sanctuary turnover buffer. Rescheduling or cancellations are accepted without fee up to 24 hours prior to your arrival.'}
            </p>
            <button
              type="button"
              onClick={() => setPolicyModal(null)}
              className="w-full py-3 bg-espresso text-alabaster text-xs uppercase tracking-widest font-medium hover:bg-champagne transition-silk cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
