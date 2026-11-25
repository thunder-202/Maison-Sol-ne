import React, { useMemo, useState } from 'react';
import { ARTISANS, SERVICE_TICKETS } from '../data/sanctuaryData';
import {
  extractServiceTicketData,
  formatHumanDate,
  formatMinutesToTime,
  suggestNextOpenSlot,
} from '../lib/schedulingEngine';
import { BookingRecord, ServiceTicket } from '../types/scheduling';

type HairCondition = 'dry' | 'scalp' | 'color';
type TimePreference = 'express' | 'signature' | 'immersion';
type AtmospherePreference = 'quiet' | 'aromatherapy' | 'elixir';

interface SensoryMatcherProps {
  bookings: BookingRecord[];
  defaultDateStr: string;
  onReserveRecommended: (ticketId: string, preferredArtisanId: string, quiet: boolean) => void;
}

export const SensoryMatcher: React.FC<SensoryMatcherProps> = ({
  bookings,
  defaultDateStr,
  onReserveRecommended,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [condition, setCondition] = useState<HairCondition>('dry');
  const [timePref, setTimePref] = useState<TimePreference>('signature');
  const [atmosphere, setAtmosphere] = useState<AtmospherePreference>('quiet');

  const recommendedTicket: ServiceTicket = useMemo(() => {
    if (condition === 'scalp') {
      return timePref === 'immersion'
        ? SERVICE_TICKETS.find((t) => t.id === 'TKT-SPA-02')!
        : SERVICE_TICKETS.find((t) => t.id === 'TKT-SPA-01')!;
    }
    if (condition === 'color') {
      if (timePref === 'express') {
        return SERVICE_TICKETS.find((t) => t.id === 'TKT-CLR-02')!;
      }
      return timePref === 'immersion'
        ? SERVICE_TICKETS.find((t) => t.id === 'TKT-CLR-01')!
        : SERVICE_TICKETS.find((t) => t.id === 'TKT-CLR-02')!;
    }
    // dry / overworked
    if (timePref === 'express') {
      return SERVICE_TICKETS.find((t) => t.id === 'TKT-CUT-03')!;
    }
    if (timePref === 'immersion') {
      return SERVICE_TICKETS.find((t) => t.id === 'TKT-CUT-02')!;
    }
    return SERVICE_TICKETS.find((t) => t.id === 'TKT-CUT-01')!;
  }, [condition, timePref]);

  const liveSuggestion = useMemo(() => {
    const spec = extractServiceTicketData(recommendedTicket);
    const preferredArtisan = recommendedTicket.recommendedArtisans[0] ?? 'any';
    return suggestNextOpenSlot(bookings, preferredArtisan, defaultDateStr, spec);
  }, [bookings, recommendedTicket, defaultDateStr]);

  const suggestedArtisanName =
    ARTISANS.find((a) => a.id === liveSuggestion.artisanId)?.name ?? 'Master Artisan';

  const stepLabel =
    step === 1
      ? 'Step 1 of 3 · Hair & Scalp State'
      : step === 2
        ? 'Step 2 of 3 · Time Allocation'
        : step === 3
          ? 'Step 3 of 3 · Suite Atmosphere'
          : 'Consultation Complete · Tailored Ritual Ready';

  return (
    <section id="consultation" className="py-20 border-b border-hairline bg-alabaster">
      <div className="max-w-5xl mx-auto px-6 md:px-12 text-center space-y-6">
        <p className="text-xs uppercase tracking-widest text-champagne font-semibold">
          Interactive Ritual Consultation
        </p>

        <h2 className="text-3xl md:text-5xl font-serif text-espresso font-light">
          Unsure which ritual your hair requires today?
        </h2>

        <p className="text-sm md:text-base text-taupe max-w-2xl mx-auto font-light leading-relaxed">
          Answer three brief intuitive questions about your hair’s current state to match your
          ritual and locate the earliest open suite window.
        </p>

        <div className="mt-8 bg-linen/60 border border-hairline p-8 md:p-12 text-left space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-widest text-taupe border-b border-hairline pb-4">
            <span>{stepLabel}</span>
            <span className="text-champagne font-medium">Sensory Matcher</span>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-espresso">
                How does your scalp and hair currently feel?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setCondition('dry');
                    setStep(2);
                  }}
                  className="border border-hairline bg-alabaster p-5 text-left hover:border-champagne transition-silk group cursor-pointer"
                >
                  <p className="text-xs uppercase tracking-wider text-espresso font-medium group-hover:text-champagne">
                    Dehydrated &amp; Overworked
                  </p>
                  <p className="text-xs text-taupe mt-1.5 leading-relaxed">
                    Needs architectural sculpting, moisture restoration, and gloss.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCondition('scalp');
                    setStep(2);
                  }}
                  className="border border-hairline bg-alabaster p-5 text-left hover:border-champagne transition-silk group cursor-pointer"
                >
                  <p className="text-xs uppercase tracking-wider text-espresso font-medium group-hover:text-champagne">
                    Scalp Tension &amp; Fatigue
                  </p>
                  <p className="text-xs text-taupe mt-1.5 leading-relaxed">
                    Needs botanical head spa, warm herbal steam, and jade Gua Sha.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCondition('color');
                    setStep(2);
                  }}
                  className="border border-hairline bg-alabaster p-5 text-left hover:border-champagne transition-silk group cursor-pointer"
                >
                  <p className="text-xs uppercase tracking-wider text-espresso font-medium group-hover:text-champagne">
                    Faded &amp; Dull Tone
                  </p>
                  <p className="text-xs text-taupe mt-1.5 leading-relaxed">
                    Needs dimensional sun-lit balayage or reflective velvet gloss.
                  </p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-espresso">
                How much time do you wish to spend in sanctuary?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setTimePref('express');
                    setStep(3);
                  }}
                  className="border border-hairline bg-alabaster p-5 text-left hover:border-champagne transition-silk group cursor-pointer"
                >
                  <p className="text-xs uppercase tracking-wider text-espresso font-medium group-hover:text-champagne">
                    Focused · 35–120 Mins
                  </p>
                  <p className="text-xs text-taupe mt-1.5 leading-relaxed">
                    Targeted restorative or precision silhouette refresh.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimePref('signature');
                    setStep(3);
                  }}
                  className="border border-hairline bg-alabaster p-5 text-left hover:border-champagne transition-silk group cursor-pointer"
                >
                  <p className="text-xs uppercase tracking-wider text-espresso font-medium group-hover:text-champagne">
                    Signature · 75–120 Mins
                  </p>
                  <p className="text-xs text-taupe mt-1.5 leading-relaxed">
                    Complete sculpt, steam therapy, and tailored finishing.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimePref('immersion');
                    setStep(3);
                  }}
                  className="border border-hairline bg-alabaster p-5 text-left hover:border-champagne transition-silk group cursor-pointer"
                >
                  <p className="text-xs uppercase tracking-wider text-espresso font-medium group-hover:text-champagne">
                    Full Immersion · 2–3+ Hours
                  </p>
                  <p className="text-xs text-taupe mt-1.5 leading-relaxed">
                    Unhurried transformation, hand-painted color, or deep infusion.
                  </p>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs uppercase tracking-widest text-taupe hover:text-espresso transition-colors cursor-pointer"
              >
                &larr; Back to Hair State
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-espresso">
                Which suite atmosphere do you prefer today?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setAtmosphere('quiet');
                    setStep(4);
                  }}
                  className="border border-hairline bg-alabaster p-5 text-left hover:border-champagne transition-silk group cursor-pointer"
                >
                  <p className="text-xs uppercase tracking-wider text-espresso font-medium group-hover:text-champagne">
                    Silent Solitude
                  </p>
                  <p className="text-xs text-taupe mt-1.5 leading-relaxed">
                    Minimal dialogue after consultation; quiet acoustic rest.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAtmosphere('aromatherapy');
                    setStep(4);
                  }}
                  className="border border-hairline bg-alabaster p-5 text-left hover:border-champagne transition-silk group cursor-pointer"
                >
                  <p className="text-xs uppercase tracking-wider text-espresso font-medium group-hover:text-champagne">
                    Botanical Aromatherapy
                  </p>
                  <p className="text-xs text-taupe mt-1.5 leading-relaxed">
                    Warm cedarwood and wild chamomile mist throughout the suite.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAtmosphere('elixir');
                    setStep(4);
                  }}
                  className="border border-hairline bg-alabaster p-5 text-left hover:border-champagne transition-silk group cursor-pointer"
                >
                  <p className="text-xs uppercase tracking-wider text-espresso font-medium group-hover:text-champagne">
                    Conversational &amp; Tea Pairing
                  </p>
                  <p className="text-xs text-taupe mt-1.5 leading-relaxed">
                    Collaborative styling consultation with silver needle tea service.
                  </p>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs uppercase tracking-widest text-taupe hover:text-espresso transition-colors cursor-pointer"
              >
                &larr; Back to Time Allocation
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 pt-1">
              <div className="p-6 bg-alabaster border border-champagne/50 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-taupe">
                  <span className="uppercase tracking-widest text-champagne font-semibold">
                    Recommended Match &middot; {recommendedTicket.id}
                  </span>
                  <span className="tabular-nums">
                    {atmosphere === 'quiet' ? 'Quiet Suite Preference' : 'Botanical Suite Service'}
                  </span>
                </div>

                <h4 className="text-2xl font-serif text-espresso">
                  {recommendedTicket.serviceName}
                </h4>

                <p className="text-xs text-taupe leading-relaxed">
                  {recommendedTicket.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-hairline text-xs">
                  <div>
                    <span className="text-taupe block">Duration &amp; Buffer</span>
                    <span className="text-espresso font-medium tabular-nums">
                      {recommendedTicket.requiredDurationMinutes} mins (+{recommendedTicket.bufferMinutes}m buffer)
                    </span>
                  </div>
                  <div>
                    <span className="text-taupe block">Next Open Slot</span>
                    <span className="text-espresso font-medium tabular-nums">
                      {liveSuggestion.found
                        ? `${formatHumanDate(liveSuggestion.dateStr)} · ${formatMinutesToTime(liveSuggestion.startMin)}`
                        : 'Check Suite Calendar'}
                    </span>
                  </div>
                  <div>
                    <span className="text-taupe block">Investment &amp; Artisan</span>
                    <span className="text-espresso font-medium tabular-nums">
                      £{recommendedTicket.price} &middot; {suggestedArtisanName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onReserveRecommended(
                      recommendedTicket.id,
                      liveSuggestion.artisanId,
                      atmosphere === 'quiet'
                    )
                  }
                  className="px-6 py-3.5 bg-espresso text-alabaster text-xs uppercase tracking-widest font-medium hover:bg-champagne transition-silk text-center whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Reserve Recommended Ritual
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 border border-hairline text-espresso text-xs uppercase tracking-widest font-medium hover:border-champagne transition-silk whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Reset Consultation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
