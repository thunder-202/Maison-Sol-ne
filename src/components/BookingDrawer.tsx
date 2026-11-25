import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Lock, RotateCcw, Sparkles, Unlock, X } from 'lucide-react';
import {
  ARTISANS,
  BOTANICAL_TEAS,
  SANCTUARY_CLOSE_MIN,
  SANCTUARY_OPEN_MIN,
  SERVICE_TICKETS,
} from '../data/sanctuaryData';
import {
  computeDaySlotGrid,
  extractServiceTicketData,
  formatHumanDate,
  formatMinutesTo24h,
  formatMinutesToTime,
  getLockedBlocksForDay,
  getNextOperatingDate,
  isSanctuaryOpenOnDate,
  lockCalendarBlock,
  suggestNextOpenSlot,
} from '../lib/schedulingEngine';
import { BookingRecord, ExtractedTicketSpec } from '../types/scheduling';

export type DrawerMode = 'reserve' | 'calendar';

interface BookingDrawerProps {
  isOpen: boolean;
  initialMode?: DrawerMode;
  initialTicketId?: string;
  initialArtisanId?: string;
  initialQuiet?: boolean;
  defaultDateStr: string;
  bookings: BookingRecord[];
  onClose: () => void;
  onBookingConfirmed: (booking: BookingRecord, nextBookings: BookingRecord[]) => void;
  onReleaseBooking: (bookingId: string) => void;
  onResetDemoSchedule: () => void;
}

const TOTAL_DAY_MINS = SANCTUARY_CLOSE_MIN - SANCTUARY_OPEN_MIN; // 600 mins

export const BookingDrawer: React.FC<BookingDrawerProps> = ({
  isOpen,
  initialMode = 'reserve',
  initialTicketId,
  initialArtisanId,
  initialQuiet = false,
  defaultDateStr,
  bookings,
  onClose,
  onBookingConfirmed,
  onReleaseBooking,
  onResetDemoSchedule,
}) => {
  const [mode, setMode] = useState<DrawerMode>(initialMode);
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    initialTicketId || SERVICE_TICKETS[0].id
  );
  const [showCustomTicketParser, setShowCustomTicketParser] = useState(false);
  const [customTicketInput, setCustomTicketInput] = useState(
    'Botanical Keratin Infusion · 135 mins'
  );
  const [customSpec, setCustomSpec] = useState<ExtractedTicketSpec | null>(null);

  const [artisanId, setArtisanId] = useState<string>(initialArtisanId || 'solene');
  const [dateStr, setDateStr] = useState<string>(defaultDateStr);
  const [selectedStartMin, setSelectedStartMin] = useState<number | null>(null);

  const [quietAppointment, setQuietAppointment] = useState<boolean>(initialQuiet);
  const [teaPreference, setTeaPreference] = useState<string>(BOTANICAL_TEAS[0]);
  const [guestName, setGuestName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [autoAdjustNotice, setAutoAdjustNotice] = useState<string | null>(null);

  // Sync props when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    if (initialTicketId) {
      setSelectedTicketId(initialTicketId);
      setCustomSpec(null);
    }
    if (initialArtisanId) {
      setArtisanId(initialArtisanId);
    }
    setQuietAppointment(initialQuiet);
    setFormError(null);
    setAutoAdjustNotice(null);
  }, [isOpen, initialMode, initialTicketId, initialArtisanId, initialQuiet]);

  // Active extracted service ticket specification
  const activeTicketSpec: ExtractedTicketSpec = useMemo(() => {
    if (customSpec) return customSpec;
    const found = SERVICE_TICKETS.find((t) => t.id === selectedTicketId) ?? SERVICE_TICKETS[0];
    return extractServiceTicketData(found);
  }, [customSpec, selectedTicketId]);

  const isDateOpen = useMemo(() => isSanctuaryOpenOnDate(dateStr), [dateStr]);

  // Real-time candidate slot grid
  const slotGrid = useMemo(
    () => computeDaySlotGrid(bookings, artisanId, dateStr, activeTicketSpec),
    [bookings, artisanId, dateStr, activeTicketSpec]
  );

  // Real-time Next Open Slot suggestion
  const nextOpenSuggestion = useMemo(
    () => suggestNextOpenSlot(bookings, artisanId, dateStr, activeTicketSpec),
    [bookings, artisanId, dateStr, activeTicketSpec]
  );

  // Automatically validate selectedStartMin whenever ticket duration, artisan, date, or bookings change
  useEffect(() => {
    if (!isOpen) return;

    const currentSlot =
      selectedStartMin !== null
        ? slotGrid.find((s) => s.startMin === selectedStartMin)
        : undefined;

    if (currentSlot && currentSlot.available) {
      return;
    }

    // Current selection is empty or now conflicts due to duration change -> snap to next open slot on this date if available
    const firstOnDate = slotGrid.find((s) => s.available);
    if (firstOnDate) {
      if (selectedStartMin !== null && currentSlot && !currentSlot.available) {
        setAutoAdjustNotice(
          `${formatMinutesToTime(selectedStartMin)} conflicts for ${activeTicketSpec.requiredDurationMinutes}m + ${activeTicketSpec.bufferMinutes}m buffer. Adjusted to next open slot (${formatMinutesToTime(firstOnDate.startMin)}).`
        );
      } else {
        setAutoAdjustNotice(null);
      }
      setSelectedStartMin(firstOnDate.startMin);
    } else {
      setSelectedStartMin(null);
    }
  }, [isOpen, slotGrid, selectedStartMin, activeTicketSpec]);

  const selectedSlotEval = useMemo(() => {
    if (selectedStartMin === null) return null;
    return slotGrid.find((s) => s.startMin === selectedStartMin) ?? null;
  }, [slotGrid, selectedStartMin]);

  // Artisan whose timeline we visualize in Reserve mode
  const timelineArtisanId = useMemo(() => {
    if (artisanId !== 'any') return artisanId;
    if (selectedSlotEval?.matchedArtisanId) return selectedSlotEval.matchedArtisanId;
    return nextOpenSuggestion.artisanId || ARTISANS[0].id;
  }, [artisanId, selectedSlotEval, nextOpenSuggestion]);

  const timelineLockedBlocks = useMemo(
    () => getLockedBlocksForDay(bookings, timelineArtisanId, dateStr),
    [bookings, timelineArtisanId, dateStr]
  );

  const handleApplyTicketPayload = () => {
    const parsed = extractServiceTicketData(customTicketInput);
    setCustomSpec(parsed);
    setShowCustomTicketParser(false);
    setAutoAdjustNotice(
      `Extracted ticket "${parsed.serviceName}" (${parsed.requiredDurationMinutes}m + ${parsed.bufferMinutes}m buffer).`
    );
  };

  const handleApplyNextSuggestion = () => {
    if (!nextOpenSuggestion.found) return;
    setDateStr(nextOpenSuggestion.dateStr);
    if (artisanId !== 'any' && nextOpenSuggestion.artisanId !== artisanId) {
      setArtisanId(nextOpenSuggestion.artisanId);
    }
    setSelectedStartMin(nextOpenSuggestion.startMin);
    setAutoAdjustNotice(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isDateOpen) {
      setFormError('The sanctuary is closed on Sunday and Monday. Please select an operating day.');
      return;
    }

    if (selectedStartMin === null || !selectedSlotEval?.available) {
      setFormError(
        'No unconflicted slot is selected for this ritual duration. Apply the suggested open slot or choose another date.'
      );
      return;
    }

    if (!guestName.trim()) {
      setFormError('Please provide your full name for the private suite registry.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail.trim())) {
      setFormError('Please provide a valid email address for your suite confirmation.');
      return;
    }

    if (guestPhone.trim().length < 7) {
      setFormError('Please provide a valid mobile phone number.');
      return;
    }

    const result = lockCalendarBlock(bookings, {
      ticket: activeTicketSpec,
      artisanIdOrAny: artisanId,
      dateStr,
      startMin: selectedStartMin,
      guestName,
      guestEmail,
      guestPhone,
      quietAppointment,
      teaPreference,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    onBookingConfirmed(result.booking, result.nextBookings);
  };

  if (!isOpen) return null;

  const timelineArtisan = ARTISANS.find((a) => a.id === timelineArtisanId);
  const hourTicks = [9, 11, 13, 15, 17, 19];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Private Chair Reservation and Dynamic Scheduling Engine"
    >
      <div onClick={onClose} className="absolute inset-0 drawer-backdrop" aria-hidden="true" />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-2xl bg-alabaster border-l border-hairline shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-hairline bg-linen flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-champagne font-semibold block">
                Dynamic Suite Scheduling Engine
              </span>
              <h2 className="text-xl font-serif text-espresso">Maison Solène</h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-hairline bg-alabaster p-0.5">
                <button
                  type="button"
                  onClick={() => setMode('reserve')}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    mode === 'reserve'
                      ? 'bg-espresso text-alabaster'
                      : 'text-taupe hover:text-espresso'
                  }`}
                >
                  Reserve Suite
                </button>
                <button
                  type="button"
                  onClick={() => setMode('calendar')}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-wider font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    mode === 'calendar'
                      ? 'bg-espresso text-alabaster'
                      : 'text-taupe hover:text-espresso'
                  }`}
                >
                  Suite Calendar
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close reservation drawer"
                className="p-2 text-taupe hover:text-espresso transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {mode === 'reserve' ? (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 1. SERVICE TICKET SELECTION & AUTOMATIC DURATION EXTRACTION */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="bookingService"
                      className="text-xs uppercase tracking-widest text-espresso font-medium"
                    >
                      1. Service Ticket Selection
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCustomTicketParser((prev) => !prev)}
                      className="text-[11px] uppercase tracking-wider text-champagne hover:text-espresso transition-colors cursor-pointer"
                    >
                      {showCustomTicketParser ? 'Use Catalog Ticket' : 'Parse Custom Ticket'}
                    </button>
                  </div>

                  {!showCustomTicketParser ? (
                    <select
                      id="bookingService"
                      value={customSpec ? '__custom__' : selectedTicketId}
                      onChange={(e) => {
                        setCustomSpec(null);
                        setSelectedTicketId(e.target.value);
                        setAutoAdjustNotice(null);
                      }}
                      className="w-full bg-alabaster border border-hairline p-3 text-xs text-espresso focus:outline-none focus:border-champagne"
                    >
                      {customSpec && (
                        <option value="__custom__">
                          {customSpec.serviceName} ({customSpec.requiredDurationMinutes} mins ·
                          Parsed Ticket)
                        </option>
                      )}
                      {SERVICE_TICKETS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.serviceName} — {t.requiredDurationMinutes} mins (+{t.bufferMinutes}m
                          buffer) · £{t.price}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 bg-linen border border-hairline space-y-3">
                      <p className="text-[11px] text-taupe">
                        Enter a ticket label or JSON payload (e.g.{' '}
                        <span className="font-mono text-espresso">
                          Velvet Gloss &amp; Trim · 90 mins
                        </span>{' '}
                        or{' '}
                        <span className="font-mono text-espresso">
                          {`{"serviceName":"Silk Ritual","duration":120}`}
                        </span>
                        ). The engine extracts the duration and recalculates locks automatically.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={customTicketInput}
                          onChange={(e) => setCustomTicketInput(e.target.value)}
                          placeholder="Service name and duration..."
                          className="flex-1 bg-alabaster border border-hairline px-3 py-2 text-xs text-espresso font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleApplyTicketPayload}
                          className="px-4 py-2 bg-espresso text-alabaster text-[11px] uppercase tracking-widest font-medium hover:bg-champagne transition-silk whitespace-nowrap cursor-pointer"
                        >
                          Extract Duration
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Extracted Ticket Readout Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-linen/70 border border-hairline text-xs tabular-nums">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-taupe block">
                        Ticket ID
                      </span>
                      <span className="font-mono text-espresso font-medium">
                        {activeTicketSpec.id}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-taupe block">
                        Extracted Duration
                      </span>
                      <span className="text-espresso font-semibold">
                        {activeTicketSpec.requiredDurationMinutes} mins
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-taupe block">
                        Turnover Buffer
                      </span>
                      <span className="text-champagne font-medium">
                        +{activeTicketSpec.bufferMinutes} mins
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-taupe block">
                        Total Suite Lock
                      </span>
                      <span className="text-espresso font-semibold">
                        {activeTicketSpec.totalFootprintMinutes} mins
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. ARTISAN & DATE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="bookingArtisan"
                      className="text-xs uppercase tracking-widest text-espresso font-medium block"
                    >
                      2. Master Artisan
                    </label>
                    <select
                      id="bookingArtisan"
                      value={artisanId}
                      onChange={(e) => setArtisanId(e.target.value)}
                      className="w-full bg-alabaster border border-hairline p-3 text-xs text-espresso focus:outline-none focus:border-champagne"
                    >
                      {ARTISANS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.role})
                        </option>
                      ))}
                      <option value="any">First Available Artisan</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="bookingDate"
                      className="text-xs uppercase tracking-widest text-espresso font-medium block"
                    >
                      Preferred Date
                    </label>
                    <input
                      id="bookingDate"
                      type="date"
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      className="w-full bg-alabaster border border-hairline p-3 text-xs text-espresso focus:outline-none focus:border-champagne tabular-nums"
                    />
                  </div>
                </div>

                {/* Sanctuary Closed Warning */}
                {!isDateOpen && (
                  <div className="p-4 bg-linen border border-champagne/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-espresso">
                      <p className="font-medium">
                        Sanctuary Closed ({formatHumanDate(dateStr)})
                      </p>
                      <p className="text-taupe mt-0.5">
                        Maison Solène is closed Sunday and Monday for botanicals formulating.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDateStr(getNextOperatingDate(dateStr))}
                      className="px-4 py-2 bg-espresso text-alabaster text-[11px] uppercase tracking-widest whitespace-nowrap shrink-0 hover:bg-champagne transition-silk cursor-pointer"
                    >
                      Jump to Open Day
                    </button>
                  </div>
                )}

                {/* Auto-Adjust Notice if ticket change caused overlap */}
                {autoAdjustNotice && (
                  <div className="p-3 bg-linen border border-hairline text-xs text-espresso flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-champagne shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{autoAdjustNotice}</span>
                  </div>
                )}

                {/* REAL-TIME NEXT OPEN SLOT SUGGESTION */}
                {nextOpenSuggestion.found && (
                  <div className="p-4 bg-alabaster border border-champagne/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-champagne font-semibold">
                        <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Suggested Next Open Slot</span>
                      </div>
                      <p className="text-xs text-espresso font-medium tabular-nums">
                        {formatHumanDate(nextOpenSuggestion.dateStr)} &middot;{' '}
                        {formatMinutesToTime(nextOpenSuggestion.startMin)} –{' '}
                        {formatMinutesToTime(nextOpenSuggestion.serviceEndMin)} (+
                        {activeTicketSpec.bufferMinutes}m buffer until{' '}
                        {formatMinutesToTime(nextOpenSuggestion.bufferEndMin)})
                      </p>
                      <p className="text-[11px] text-taupe">{nextOpenSuggestion.explanation}</p>
                    </div>

                    {(nextOpenSuggestion.isDifferentDate ||
                      selectedStartMin !== nextOpenSuggestion.startMin) && (
                      <button
                        type="button"
                        onClick={handleApplyNextSuggestion}
                        className="px-4 py-2 border border-champagne text-champagne hover:bg-champagne hover:text-alabaster text-[11px] uppercase tracking-widest font-medium transition-silk whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Apply Suggested Slot
                      </button>
                    )}
                  </div>
                )}

                {/* LIVE VISUAL SUITE TIMELINE (09:00 - 19:00) */}
                {isDateOpen && (
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="uppercase tracking-widest text-espresso font-medium">
                        Suite Availability Timeline &middot;{' '}
                        {timelineArtisan?.name.split(' ')[0]}
                      </span>
                      <span className="text-[11px] text-taupe">
                        Locked blocks &amp; turnover buffers protected
                      </span>
                    </div>

                    <div className="relative h-12 bg-linen border border-hairline overflow-hidden">
                      {/* Hour gridlines */}
                      {hourTicks.map((hr) => {
                        const leftPct = ((hr * 60 - SANCTUARY_OPEN_MIN) / TOTAL_DAY_MINS) * 100;
                        return (
                          <div
                            key={hr}
                            style={{ left: `${leftPct}%` }}
                            className="absolute inset-y-0 border-l border-hairline/70 pointer-events-none"
                          />
                        );
                      })}

                      {/* Existing locked blocks + buffers */}
                      {timelineLockedBlocks.map((block) => {
                        const serviceLeft =
                          ((block.startMin - SANCTUARY_OPEN_MIN) / TOTAL_DAY_MINS) * 100;
                        const serviceWidth =
                          ((block.serviceEndMin - block.startMin) / TOTAL_DAY_MINS) * 100;
                        const bufferLeft =
                          ((block.serviceEndMin - SANCTUARY_OPEN_MIN) / TOTAL_DAY_MINS) * 100;
                        const bufferWidth =
                          ((block.bufferEndMin - block.serviceEndMin) / TOTAL_DAY_MINS) * 100;

                        return (
                          <React.Fragment key={block.booking.id}>
                            <div
                              title={`Locked: ${block.booking.serviceName} (${formatMinutesToTime(block.startMin)}–${formatMinutesToTime(block.serviceEndMin)})`}
                              style={{ left: `${serviceLeft}%`, width: `${serviceWidth}%` }}
                              className="absolute inset-y-1 bg-espresso text-alabaster flex items-center justify-center px-1 overflow-hidden border-r border-alabaster/30"
                            >
                              <span className="text-[10px] font-mono truncate">
                                {block.booking.reference}
                              </span>
                            </div>
                            <div
                              title={`Turnover Buffer: +${block.booking.bufferMinutes}m`}
                              style={{ left: `${bufferLeft}%`, width: `${bufferWidth}%` }}
                              className="absolute inset-y-1 bg-buffer-hatch border-r border-champagne/40"
                            />
                          </React.Fragment>
                        );
                      })}

                      {/* Proposed active selection preview */}
                      {selectedSlotEval?.available && (
                        <>
                          <div
                            style={{
                              left: `${((selectedSlotEval.startMin - SANCTUARY_OPEN_MIN) / TOTAL_DAY_MINS) * 100}%`,
                              width: `${((selectedSlotEval.serviceEndMin - selectedSlotEval.startMin) / TOTAL_DAY_MINS) * 100}%`,
                            }}
                            className="absolute inset-y-1 bg-champagne text-alabaster flex items-center justify-center px-1 overflow-hidden"
                          >
                            <span className="text-[10px] font-mono truncate">Selected</span>
                          </div>
                          <div
                            style={{
                              left: `${((selectedSlotEval.serviceEndMin - SANCTUARY_OPEN_MIN) / TOTAL_DAY_MINS) * 100}%`,
                              width: `${((selectedSlotEval.bufferEndMin - selectedSlotEval.serviceEndMin) / TOTAL_DAY_MINS) * 100}%`,
                            }}
                            className="absolute inset-y-1 bg-champagne/25 border border-dashed border-champagne"
                          />
                        </>
                      )}
                    </div>

                    {/* Time Axis Labels + Legend */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-taupe tabular-nums">
                      <span>09:00</span>
                      <span>11:30</span>
                      <span>14:00</span>
                      <span>16:30</span>
                      <span>19:00</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-5 text-[11px] text-taupe pt-1">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-espresso inline-block" aria-hidden="true" />
                        Locked Reservation
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 bg-buffer-hatch border border-champagne/50 inline-block"
                          aria-hidden="true"
                        />
                        Turnover Buffer
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-champagne inline-block" aria-hidden="true" />
                        Your Selected Block
                      </span>
                    </div>
                  </div>
                )}

                {/* CANDIDATE TIME SLOT GRID */}
                {isDateOpen && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs uppercase tracking-widest text-espresso font-medium">
                        Select Start Time (15-Min Increments)
                      </span>
                      {selectedSlotEval?.available && (
                        <span className="text-xs font-mono text-champagne tabular-nums">
                          {formatMinutesToTime(selectedSlotEval.startMin)} &rarr;{' '}
                          {formatMinutesToTime(selectedSlotEval.serviceEndMin)} (+
                          {activeTicketSpec.bufferMinutes}m)
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                      {slotGrid.map((slot) => {
                        const isSelected = selectedStartMin === slot.startMin && slot.available;
                        return (
                          <button
                            key={slot.startMin}
                            type="button"
                            disabled={!slot.available}
                            title={
                              slot.available
                                ? `Open: ${formatMinutesToTime(slot.startMin)} – ${formatMinutesToTime(slot.serviceEndMin)}`
                                : slot.conflictReason || 'Unavailable'
                            }
                            onClick={() => {
                              setSelectedStartMin(slot.startMin);
                              setAutoAdjustNotice(null);
                            }}
                            className={`px-2.5 py-2 text-xs font-mono tabular-nums border text-left transition-colors ${
                              isSelected
                                ? 'bg-espresso text-alabaster border-espresso cursor-pointer'
                                : slot.available
                                  ? 'bg-alabaster text-espresso border-hairline hover:border-champagne cursor-pointer'
                                  : 'bg-linen/60 text-taupe/55 border-hairline/60 cursor-not-allowed line-through'
                            }`}
                          >
                            <span className="block">{formatMinutesTo24h(slot.startMin)}</span>
                            <span className="block text-[10px] opacity-80">
                              {slot.available
                                ? `→ ${formatMinutesTo24h(slot.serviceEndMin)}`
                                : 'Locked'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. QUIET PREFERENCES */}
                <div className="p-4 bg-linen border border-hairline space-y-4">
                  <label className="flex items-center justify-between gap-4 cursor-pointer">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-espresso font-medium block">
                        Quiet Appointment
                      </span>
                      <span className="text-[11px] text-taupe">
                        Minimal conversation after initial consultation.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={quietAppointment}
                      onChange={(e) => setQuietAppointment(e.target.checked)}
                      className="accent-champagne w-4 h-4 shrink-0"
                    />
                  </label>

                  <div className="border-t border-hairline pt-3 space-y-2">
                    <label
                      htmlFor="teaPreference"
                      className="text-[11px] uppercase tracking-wider text-espresso font-medium block"
                    >
                      Complimentary Botanical Tea
                    </label>
                    <select
                      id="teaPreference"
                      value={teaPreference}
                      onChange={(e) => setTeaPreference(e.target.value)}
                      className="w-full bg-alabaster border border-hairline p-2.5 text-xs text-espresso focus:outline-none focus:border-champagne"
                    >
                      {BOTANICAL_TEAS.map((tea) => (
                        <option key={tea} value={tea}>
                          {tea}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. GUEST DETAILS */}
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-widest text-espresso font-medium block">
                    3. Guest Information
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Full Name"
                      aria-label="Full Name"
                      className="w-full bg-alabaster border border-hairline p-3 text-xs text-espresso focus:outline-none focus:border-champagne sm:col-span-2"
                    />
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="Email Address"
                      aria-label="Email Address"
                      className="w-full bg-alabaster border border-hairline p-3 text-xs text-espresso focus:outline-none focus:border-champagne"
                    />
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="Mobile Phone Number"
                      aria-label="Mobile Phone Number"
                      className="w-full bg-alabaster border border-hairline p-3 text-xs text-espresso focus:outline-none focus:border-champagne"
                    />
                  </div>
                </div>

                {formError && (
                  <div
                    role="alert"
                    className="p-3.5 bg-linen border border-espresso text-xs text-espresso"
                  >
                    {formError}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-hairline bg-linen space-y-2.5">
                <button
                  type="submit"
                  className="w-full py-4 bg-espresso text-alabaster text-xs uppercase tracking-widest font-medium hover:bg-champagne transition-silk cursor-pointer"
                >
                  Confirm &amp; Lock Suite Block
                </button>
                <p className="text-[11px] text-center text-taupe">
                  No payment required now. Cancellations accepted up to 24 hours prior.
                </p>
              </div>
            </form>
          ) : (
            /* SUITE CALENDAR & LOCKS VIEW */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
                  <div>
                    <h3 className="text-lg font-serif text-espresso">
                      Real-Time Suite Locks &amp; Buffers
                    </h3>
                    <p className="text-xs text-taupe">
                      Inspect locked service tickets across all three private suites on{' '}
                      {formatHumanDate(dateStr)}.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-champagne" aria-hidden="true" />
                    <input
                      type="date"
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      aria-label="Calendar Inspection Date"
                      className="bg-alabaster border border-hairline px-3 py-2 text-xs text-espresso tabular-nums"
                    />
                  </div>
                </div>

                {!isDateOpen ? (
                  <div className="p-6 bg-linen border border-hairline text-center space-y-3">
                    <p className="text-sm font-serif text-espresso">
                      Sanctuary Closed on {formatHumanDate(dateStr)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setDateStr(getNextOperatingDate(dateStr))}
                      className="px-4 py-2 bg-espresso text-alabaster text-xs uppercase tracking-widest cursor-pointer"
                    >
                      View Next Operating Day
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {ARTISANS.map((artisan) => {
                      const blocks = getLockedBlocksForDay(bookings, artisan.id, dateStr);
                      return (
                        <div key={artisan.id} className="border border-hairline bg-alabaster p-5 space-y-4">
                          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-hairline pb-3">
                            <div>
                              <h4 className="text-lg font-serif text-espresso">{artisan.name}</h4>
                              <p className="text-[11px] text-taupe">
                                {artisan.suiteName} &middot; {artisan.role}
                              </p>
                            </div>
                            <span className="text-xs font-mono text-champagne tabular-nums">
                              {blocks.length} locked {blocks.length === 1 ? 'block' : 'blocks'}
                            </span>
                          </div>

                          {blocks.length === 0 ? (
                            <p className="text-xs text-taupe italic">
                              Suite completely open (09:00 AM – 07:00 PM).
                            </p>
                          ) : (
                            <div className="space-y-2.5">
                              {blocks.map((block) => (
                                <div
                                  key={block.booking.id}
                                  className="p-3 bg-linen/70 border border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-medium text-espresso">
                                      <Lock className="w-3.5 h-3.5 text-champagne" aria-hidden="true" />
                                      <span>{block.booking.serviceName}</span>
                                      <span className="font-mono text-[11px] text-taupe">
                                        {block.booking.reference}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-taupe tabular-nums">
                                      Guest: {block.booking.guestName} &middot; Locked{' '}
                                      <span className="font-mono text-espresso">
                                        {formatMinutesToTime(block.startMin)}–
                                        {formatMinutesToTime(block.serviceEndMin)}
                                      </span>{' '}
                                      ({block.booking.requiredDurationMinutes}m) +{' '}
                                      <span className="font-mono text-champagne">
                                        {block.booking.bufferMinutes}m buffer
                                      </span>{' '}
                                      until {formatMinutesToTime(block.bufferEndMin)}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => onReleaseBooking(block.booking.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-hairline text-[11px] uppercase tracking-wider text-espresso hover:bg-espresso hover:text-alabaster transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                                  >
                                    <Unlock className="w-3 h-3" aria-hidden="true" />
                                    <span>Release Block</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-hairline bg-linen flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onResetDemoSchedule}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-taupe hover:text-espresso transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Restore Sample Schedule</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('reserve')}
                  className="w-full sm:w-auto px-6 py-3 bg-espresso text-alabaster text-xs uppercase tracking-widest font-medium hover:bg-champagne transition-silk cursor-pointer"
                >
                  Book Open Slot
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
