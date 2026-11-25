import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { HERO_IMAGE_PATH } from '../data/sanctuaryData';

interface HeroSectionProps {
  onOpenBooking: () => void;
  onScrollToMatcher: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBooking,
  onScrollToMatcher,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <section className="relative border-b border-hairline overflow-hidden py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-8 z-10">
          <div className="flex items-center space-x-3 text-xs tracking-widest uppercase text-champagne font-medium">
            <span className="w-8 h-px bg-champagne" aria-hidden="true" />
            <span>Bespoke Hair &amp; Botanical Sanctuary &middot; Mayfair</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-light text-espresso leading-[1.08] tracking-tight">
            Quiet luxury,
            <br />
            <span className="italic font-normal text-champagne">sculpted strand</span> by strand.
          </h1>

          <p className="text-base sm:text-lg text-taupe font-light max-w-xl leading-relaxed">
            An unhurried sanctuary dedicated to bespoke organic coloring, botanical head treatments,
            and customized architectural hair design. Every reservation automatically locks a private
            suite and sanctuary turnover buffer.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={onOpenBooking}
              className="px-8 py-4 bg-espresso text-alabaster text-xs uppercase tracking-widest font-medium hover:bg-champagne transition-silk text-center whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reserve Private Appointment
            </button>
            <button
              type="button"
              onClick={onScrollToMatcher}
              className="px-7 py-4 border border-hairline text-espresso text-xs uppercase tracking-widest font-medium hover:border-champagne hover:text-champagne transition-silk flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Take Sensory Matcher</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="pt-8 border-t border-hairline grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div>
              <p className="text-2xl font-serif text-espresso tabular-nums">1:1</p>
              <p className="text-[11px] uppercase tracking-widest text-taupe">Private Suite Ratio</p>
            </div>
            <div>
              <p className="text-2xl font-serif text-espresso tabular-nums">100%</p>
              <p className="text-[11px] uppercase tracking-widest text-taupe">
                Botanical Formulations
              </p>
            </div>
            <div>
              <p className="text-2xl font-serif text-espresso">Zero</p>
              <p className="text-[11px] uppercase tracking-widest text-taupe">Chemical Ammonia</p>
            </div>
          </div>

          <p className="text-xs text-taupe tracking-wide">
            No. 42 Rue de L’Orangerie, Mayfair &middot; Tuesday – Saturday &middot; 09:00 – 19:00
          </p>
        </div>

        <div className="lg:col-span-5 relative flex items-center">
          <div className="relative w-full mx-auto max-w-md lg:max-w-none">
            <div
              className="absolute -inset-3 border border-hairline pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden aspect-[3/4] bg-linen border border-hairline">
              {!imgError ? (
                <img
                  src={HERO_IMAGE_PATH}
                  alt="Maison Solène private botanical hair suite with travertine basin and linen drapes"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover opacity-95 hover:scale-105 transition-silk duration-700"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-linen to-alabaster">
                  <span className="text-xs uppercase tracking-widest text-champagne font-medium mb-2">
                    Maison Solène
                  </span>
                  <p className="text-2xl font-serif text-espresso">Private Suite Sanctuary</p>
                  <p className="text-xs text-taupe mt-2">No. 42 Rue de L’Orangerie, Mayfair</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
