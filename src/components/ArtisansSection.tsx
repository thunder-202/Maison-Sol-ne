import React, { useState } from 'react';
import { ARTISANS, SERVICE_TICKETS } from '../data/sanctuaryData';
import {
  extractServiceTicketData,
  formatHumanDate,
  formatMinutesToTime,
  suggestNextOpenSlot,
} from '../lib/schedulingEngine';
import { BookingRecord } from '../types/scheduling';

interface ArtisansSectionProps {
  bookings: BookingRecord[];
  defaultDateStr: string;
  onBookWithArtisan: (artisanId: string) => void;
}

export const ArtisansSection: React.FC<ArtisansSectionProps> = ({
  bookings,
  defaultDateStr,
  onBookWithArtisan,
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const referenceSpec = extractServiceTicketData(SERVICE_TICKETS[0]); // 75m baseline preview

  return (
    <section id="artisans" className="py-24 border-b border-hairline bg-alabaster">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs tracking-widest uppercase text-champagne font-semibold block">
              Craftsmanship
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-espresso font-light">
              Master Artisans
            </h2>
            <p className="text-sm text-taupe font-light">
              Each stylist operates as an independent artisan in dedicated private suites, mastering
              specific hair disciplines with real-time calendar isolation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {ARTISANS.map((artisan) => {
            const firstName = artisan.name.split(' ')[0];
            const nextSlot = suggestNextOpenSlot(
              bookings,
              artisan.id,
              defaultDateStr,
              referenceSpec
            );
            const hasFailed = Boolean(failedImages[artisan.id]);

            return (
              <div key={artisan.id} className="group space-y-5 flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="relative overflow-hidden aspect-[3/4] bg-linen border border-hairline">
                    {!hasFailed ? (
                      <img
                        src={artisan.imagePath}
                        alt={`${artisan.name} — ${artisan.role}`}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [artisan.id]: true }))
                        }
                        className="w-full h-full object-cover grayscale opacity-95 group-hover:grayscale-0 group-hover:scale-105 transition-silk duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-linen to-alabaster">
                        <span className="text-xs uppercase tracking-widest text-champagne">
                          {artisan.role}
                        </span>
                        <p className="text-2xl font-serif text-espresso mt-1">{artisan.name}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent opacity-0 group-hover:opacity-100 transition-silk flex items-end p-6">
                      <span className="text-xs uppercase tracking-widest text-alabaster font-medium">
                        {artisan.experience}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-2xl font-serif text-espresso">{artisan.name}</h3>
                      <span className="text-[11px] uppercase tracking-widest text-champagne font-semibold whitespace-nowrap">
                        {artisan.role}
                      </span>
                    </div>
                    <p className="text-xs text-taupe">{artisan.specialty}</p>
                    <p className="text-[11px] text-espresso/80 tabular-nums pt-1">
                      {artisan.suiteName} &middot;{' '}
                      {nextSlot.found
                        ? `Next open: ${formatHumanDate(nextSlot.dateStr)} ${formatMinutesToTime(nextSlot.startMin)}`
                        : 'Check calendar'}
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => onBookWithArtisan(artisan.id)}
                    className="text-xs uppercase tracking-widest text-espresso font-medium hover:text-champagne hover-underline-glide inline-block pt-1 whitespace-nowrap cursor-pointer"
                  >
                    Book Suite with {firstName} &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
