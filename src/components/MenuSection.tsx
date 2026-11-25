import React, { useMemo, useState } from 'react';
import { ARTISANS, SERVICE_TICKETS } from '../data/sanctuaryData';
import {
  extractServiceTicketData,
  formatHumanDate,
  formatMinutesToTime,
  suggestNextOpenSlot,
} from '../lib/schedulingEngine';
import { BookingRecord, ServiceCategory } from '../types/scheduling';

interface MenuSectionProps {
  bookings: BookingRecord[];
  defaultDateStr: string;
  onSelectService: (ticketId: string) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  bookings,
  defaultDateStr,
  onSelectService,
}) => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('cut');

  const tabs: { id: ServiceCategory; label: string }[] = [
    { id: 'cut', label: '01. Cut & Architectural Sculpt' },
    { id: 'color', label: '02. Dimensional Color & Gloss' },
    { id: 'spa', label: '03. Botanical Head Spa' },
  ];

  const visibleTickets = useMemo(
    () => SERVICE_TICKETS.filter((t) => t.category === activeCategory),
    [activeCategory]
  );

  return (
    <section id="menu" className="py-24 border-b border-hairline bg-linen/30">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="text-center space-y-4 mb-14">
          <span className="text-xs tracking-widest uppercase text-champagne font-semibold block">
            Menu &amp; Offerings
          </span>
          <h2 className="text-3xl md:text-5xl font-serif text-espresso font-light">
            Curated Hair &amp; Scalp Rituals
          </h2>
          <p className="text-sm text-taupe max-w-xl mx-auto font-light">
            Selecting any ritual automatically extracts its required suite duration, appends a
            sanctuary turnover buffer, and surfaces the earliest unconflicted appointment window.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Service Categories"
          className="flex justify-start md:justify-center border-b border-hairline mb-12 overflow-x-auto gap-8 text-xs uppercase tracking-widest font-medium"
        >
          {tabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(tab.id)}
                className={`py-4 border-b-2 transition-silk whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-champagne text-espresso'
                    : 'border-transparent text-taupe hover:text-espresso'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-8">
          {visibleTickets.map((ticket) => {
            const spec = extractServiceTicketData(ticket);
            const nextSlot = suggestNextOpenSlot(bookings, 'any', defaultDateStr, spec);
            const nextArtisan = ARTISANS.find((a) => a.id === nextSlot.artisanId)?.name.split(' ')[0];

            return (
              <div
                key={ticket.id}
                className="group border-b border-hairline pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-xl font-serif text-espresso group-hover:text-champagne transition-colors">
                      {ticket.serviceName}
                    </h3>
                    <span className="text-xs font-mono text-taupe tabular-nums">
                      {ticket.id} &middot; {ticket.requiredDurationMinutes} mins &middot; +
                      {ticket.bufferMinutes}m buffer
                    </span>
                  </div>
                  <p className="text-xs text-taupe leading-relaxed">{ticket.description}</p>
                  {nextSlot.found && (
                    <p className="text-[11px] text-champagne font-medium tabular-nums pt-0.5">
                      Next open suite: {formatHumanDate(nextSlot.dateStr)} at{' '}
                      {formatMinutesToTime(nextSlot.startMin)} ({nextArtisan})
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
                  <span className="text-lg font-serif text-espresso tabular-nums">
                    £{ticket.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectService(ticket.id)}
                    className="px-4 py-2.5 border border-hairline text-[11px] uppercase tracking-widest text-espresso hover:bg-espresso hover:text-alabaster hover:border-espresso transition-silk font-medium whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    + Select
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
