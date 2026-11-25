import {
  ARTISANS,
  SANCTUARY_CLOSE_MIN,
  SANCTUARY_OPEN_MIN,
  SERVICE_TICKETS,
  SLOT_INCREMENT_MIN,
} from '../data/sanctuaryData';
import {
  BookingRecord,
  CandidateSlotEvaluation,
  ExtractedTicketSpec,
  LockedCalendarBlock,
  NextOpenSlotSuggestion,
  RawTicketPayload,
  ServiceTicket,
} from '../types/scheduling';

/**
 * Formats minutes from midnight into 24h or 12h clean tabular label.
 */
export function formatMinutesToTime(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, totalMinutes));
  const hours24 = Math.floor(clamped / 60);
  const mins = clamped % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
}

export function formatMinutesTo24h(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours24).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function formatHumanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d, 12, 0, 0);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Maison Solène operates Tuesday–Saturday (09:00–19:00).
 * Closed Sunday (0) & Monday (1) for botanicals formulating.
 */
export function isSanctuaryOpenOnDate(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return false;
  const date = new Date(y, m - 1, d, 12, 0, 0);
  const dayOfWeek = date.getDay();
  return dayOfWeek >= 2 && dayOfWeek <= 6;
}

export function addDaysToDateStr(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0);
  date.setDate(date.getDate() + deltaDays);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function getNextOperatingDate(fromDateStr: string): string {
  let cursor = fromDateStr;
  for (let i = 0; i < 14; i++) {
    if (isSanctuaryOpenOnDate(cursor)) return cursor;
    cursor = addDaysToDateStr(cursor, 1);
  }
  return fromDateStr;
}

/**
 * Calculates required sanctuary turnover buffer based on ritual duration.
 */
export function calculateTurnoverBuffer(durationMinutes: number): number {
  if (durationMinutes <= 45) return 10;
  if (durationMinutes <= 150) return 15;
  return 20;
}

/**
 * Dynamic Ticket Extractor:
 * Reads structured ServiceTicket objects, JSON payloads, or raw ticket strings
 * (e.g., "Botanical Gloss Refresh · 90 Mins" or '{"serviceName":"Deep Steam","duration":60}')
 * and automatically extracts serviceName, requiredDurationMinutes, and bufferMinutes.
 */
export function extractServiceTicketData(
  input: ServiceTicket | RawTicketPayload | string
): ExtractedTicketSpec {
  if (typeof input !== 'string' && 'category' in input) {
    return {
      id: input.id,
      serviceName: input.serviceName,
      requiredDurationMinutes: input.requiredDurationMinutes,
      bufferMinutes: input.bufferMinutes,
      totalFootprintMinutes: input.requiredDurationMinutes + input.bufferMinutes,
      price: input.price,
      source: 'catalog',
    };
  }

  let parsedName = '';
  let parsedDuration = 0;
  let parsedId = '';
  let parsedPrice: number | null = null;

  if (typeof input === 'string') {
    const trimmed = input.trim();
    // Try JSON parse first
    if (trimmed.startsWith('{')) {
      try {
        const obj = JSON.parse(trimmed) as RawTicketPayload;
        return extractServiceTicketData(obj);
      } catch {
        // Fall through to regex extraction
      }
    }

    // Match duration patterns like "90 mins", "90m", "120 minutes", "2h", "1.5 hrs"
    const hourMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:hr|hrs|hour|hours|h)\b/i);
    const minMatch = trimmed.match(/(\d+)\s*(?:min|mins|minute|minutes|m)\b/i);

    if (minMatch) {
      parsedDuration = parseInt(minMatch[1], 10);
    } else if (hourMatch) {
      parsedDuration = Math.round(parseFloat(hourMatch[1]) * 60);
    }

    // Strip duration tokens and separators to recover clean service name
    parsedName = trimmed
      .replace(/(\d+(?:\.\d+)?)\s*(?:hr|hrs|hour|hours|h|min|mins|minute|minutes|m)\b/gi, '')
      .replace(/[·|•\-–—()[\]]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!parsedName) {
      parsedName = 'Custom Bespoke Ritual';
    }
  } else {
    parsedId = input.id ?? '';
    parsedName = (input.serviceName || input.name || '').trim();

    const rawDur = input.requiredDurationMinutes ?? input.duration;
    if (typeof rawDur === 'number') {
      parsedDuration = rawDur;
    } else if (typeof rawDur === 'string') {
      const m = rawDur.match(/(\d+)/);
      if (m) parsedDuration = parseInt(m[1], 10);
    }

    if (typeof input.price === 'number') {
      parsedPrice = input.price;
    }
  }

  // Check if name matches a catalog ticket
  const catalogMatch = SERVICE_TICKETS.find(
    (t) =>
      (parsedId && t.id.toLowerCase() === parsedId.toLowerCase()) ||
      t.serviceName.toLowerCase() === parsedName.toLowerCase()
  );

  if (catalogMatch && (!parsedDuration || parsedDuration === catalogMatch.requiredDurationMinutes)) {
    return {
      id: catalogMatch.id,
      serviceName: catalogMatch.serviceName,
      requiredDurationMinutes: catalogMatch.requiredDurationMinutes,
      bufferMinutes: catalogMatch.bufferMinutes,
      totalFootprintMinutes: catalogMatch.requiredDurationMinutes + catalogMatch.bufferMinutes,
      price: catalogMatch.price,
      source: 'catalog',
    };
  }

  const sanitizedDuration = Math.max(15, Math.min(360, parsedDuration || 60));
  const bufferMinutes = calculateTurnoverBuffer(sanitizedDuration);

  return {
    id: parsedId || `TKT-CUSTOM-${sanitizedDuration}`,
    serviceName: parsedName || 'Custom Bespoke Ritual',
    requiredDurationMinutes: sanitizedDuration,
    bufferMinutes,
    totalFootprintMinutes: sanitizedDuration + bufferMinutes,
    price: parsedPrice,
    source: 'parsed-ticket',
  };
}

/**
 * Returns sorted locked calendar blocks (service + buffer) for a specific artisan and date.
 */
export function getLockedBlocksForDay(
  bookings: BookingRecord[],
  artisanId: string,
  dateStr: string
): LockedCalendarBlock[] {
  return bookings
    .filter((b) => b.artisanId === artisanId && b.dateStr === dateStr)
    .map((booking) => ({
      booking,
      startMin: booking.startMin,
      serviceEndMin: booking.serviceEndMin,
      bufferEndMin: booking.bufferEndMin,
    }))
    .sort((a, b) => a.startMin - b.startMin);
}

/**
 * Evaluates whether a specific artisan can accommodate [candidateStartMin, candidateStartMin + duration + buffer]
 * on dateStr without overlapping any existing locked block or its trailing buffer.
 */
export function evaluateArtisanSlot(
  bookings: BookingRecord[],
  artisanId: string,
  dateStr: string,
  ticket: ExtractedTicketSpec,
  candidateStartMin: number
): CandidateSlotEvaluation {
  const serviceEndMin = candidateStartMin + ticket.requiredDurationMinutes;
  const bufferEndMin = serviceEndMin + ticket.bufferMinutes;

  if (!isSanctuaryOpenOnDate(dateStr)) {
    return {
      startMin: candidateStartMin,
      serviceEndMin,
      bufferEndMin,
      available: false,
      matchedArtisanId: null,
      conflictReason: 'Sanctuary closed Sunday & Monday',
      precedingBufferApplied: false,
    };
  }

  if (candidateStartMin < SANCTUARY_OPEN_MIN) {
    return {
      startMin: candidateStartMin,
      serviceEndMin,
      bufferEndMin,
      available: false,
      matchedArtisanId: null,
      conflictReason: 'Before 09:00 AM opening',
      precedingBufferApplied: false,
    };
  }

  if (serviceEndMin > SANCTUARY_CLOSE_MIN) {
    return {
      startMin: candidateStartMin,
      serviceEndMin,
      bufferEndMin,
      available: false,
      matchedArtisanId: null,
      conflictReason: `Exceeds 07:00 PM closing (${ticket.requiredDurationMinutes}m needed)`,
      precedingBufferApplied: false,
    };
  }

  const lockedBlocks = getLockedBlocksForDay(bookings, artisanId, dateStr);
  let precedingBufferApplied = false;

  for (const block of lockedBlocks) {
    // Check if candidate starts right when a previous block's buffer ends
    if (candidateStartMin === block.bufferEndMin) {
      precedingBufferApplied = true;
    }

    // Overlap check: [candidateStartMin, bufferEndMin) vs [block.startMin, block.bufferEndMin)
    const overlaps = candidateStartMin < block.bufferEndMin && block.startMin < bufferEndMin;
    if (overlaps) {
      const artisanName = ARTISANS.find((a) => a.id === artisanId)?.name.split(' ')[0] ?? 'Artisan';
      const inBufferZone =
        candidateStartMin >= block.serviceEndMin && candidateStartMin < block.bufferEndMin;

      const reason = inBufferZone
        ? `${artisanName} turnover buffer until ${formatMinutesToTime(block.bufferEndMin)}`
        : `Overlaps ${block.booking.reference} (${formatMinutesToTime(block.startMin)}–${formatMinutesToTime(block.serviceEndMin)} + ${block.booking.bufferMinutes}m buffer)`;

      return {
        startMin: candidateStartMin,
        serviceEndMin,
        bufferEndMin,
        available: false,
        matchedArtisanId: null,
        conflictReason: reason,
        precedingBufferApplied: false,
      };
    }
  }

  return {
    startMin: candidateStartMin,
    serviceEndMin,
    bufferEndMin,
    available: true,
    matchedArtisanId: artisanId,
    conflictReason: null,
    precedingBufferApplied,
  };
}

/**
 * Evaluates all 15-minute slots across 09:00–19:00 for either a specific artisan or "any".
 */
export function computeDaySlotGrid(
  bookings: BookingRecord[],
  artisanIdOrAny: string,
  dateStr: string,
  ticket: ExtractedTicketSpec
): CandidateSlotEvaluation[] {
  const slots: CandidateSlotEvaluation[] = [];
  const latestStart = SANCTUARY_CLOSE_MIN - 30;

  for (let t = SANCTUARY_OPEN_MIN; t <= latestStart; t += SLOT_INCREMENT_MIN) {
    if (artisanIdOrAny === 'any') {
      let matched: CandidateSlotEvaluation | null = null;
      let fallbackConflict: CandidateSlotEvaluation | null = null;

      for (const artisan of ARTISANS) {
        const res = evaluateArtisanSlot(bookings, artisan.id, dateStr, ticket, t);
        if (res.available) {
          matched = res;
          break;
        }
        if (!fallbackConflict) {
          fallbackConflict = res;
        }
      }

      slots.push(
        matched ??
          fallbackConflict ?? {
            startMin: t,
            serviceEndMin: t + ticket.requiredDurationMinutes,
            bufferEndMin: t + ticket.totalFootprintMinutes,
            available: false,
            matchedArtisanId: null,
            conflictReason: 'All private suites locked at this hour',
            precedingBufferApplied: false,
          }
      );
    } else {
      slots.push(evaluateArtisanSlot(bookings, artisanIdOrAny, dateStr, ticket, t));
    }
  }

  return slots;
}

/**
 * Automatically calculates availability buffers and suggests the next open slot
 * based on real-time calendar locks. Scans the selected date first, then scans up to
 * 14 forward operating days if the selected day is closed or fully booked.
 */
export function suggestNextOpenSlot(
  bookings: BookingRecord[],
  artisanIdOrAny: string,
  selectedDateStr: string,
  ticket: ExtractedTicketSpec
): NextOpenSlotSuggestion {
  let cursorDate = selectedDateStr;

  for (let dayOffset = 0; dayOffset < 21; dayOffset++) {
    if (isSanctuaryOpenOnDate(cursorDate)) {
      const grid = computeDaySlotGrid(bookings, artisanIdOrAny, cursorDate, ticket);
      const firstAvailable = grid.find((s) => s.available);

      if (firstAvailable && firstAvailable.matchedArtisanId) {
        const artisanName =
          ARTISANS.find((a) => a.id === firstAvailable.matchedArtisanId)?.name ?? 'Master Artisan';
        const isDifferentDate = cursorDate !== selectedDateStr;

        let explanation = '';
        if (isDifferentDate) {
          explanation = !isSanctuaryOpenOnDate(selectedDateStr)
            ? `Selected date is closed. Next open ${ticket.requiredDurationMinutes}m suite window with ${artisanName} is ${formatHumanDate(cursorDate)}.`
            : `No contiguous ${ticket.requiredDurationMinutes}m + ${ticket.bufferMinutes}m buffer block remains on ${formatHumanDate(selectedDateStr)}. Next open slot is ${formatHumanDate(cursorDate)}.`;
        } else if (firstAvailable.precedingBufferApplied) {
          explanation = `Earliest open window immediately following prior ritual + turnover buffer (${ticket.requiredDurationMinutes}m ritual + ${ticket.bufferMinutes}m buffer).`;
        } else {
          explanation = `Earliest unconflicted ${ticket.requiredDurationMinutes}m window with +${ticket.bufferMinutes}m turnover buffer cleared.`;
        }

        return {
          found: true,
          dateStr: cursorDate,
          isDifferentDate,
          startMin: firstAvailable.startMin,
          serviceEndMin: firstAvailable.serviceEndMin,
          bufferEndMin: firstAvailable.bufferEndMin,
          artisanId: firstAvailable.matchedArtisanId,
          explanation,
        };
      }
    }
    cursorDate = addDaysToDateStr(cursorDate, 1);
  }

  return {
    found: false,
    dateStr: selectedDateStr,
    isDifferentDate: false,
    startMin: SANCTUARY_OPEN_MIN,
    serviceEndMin: SANCTUARY_OPEN_MIN + ticket.requiredDurationMinutes,
    bufferEndMin: SANCTUARY_OPEN_MIN + ticket.totalFootprintMinutes,
    artisanId: artisanIdOrAny === 'any' ? ARTISANS[0].id : artisanIdOrAny,
    explanation: 'No open window found within the next 21 days for this duration.',
  };
}

/**
 * Atomically verifies slot availability and locks the calendar block + buffer.
 */
export function lockCalendarBlock(
  existingBookings: BookingRecord[],
  params: {
    ticket: ExtractedTicketSpec;
    artisanIdOrAny: string;
    dateStr: string;
    startMin: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    quietAppointment: boolean;
    teaPreference: string;
  }
): { ok: true; booking: BookingRecord; nextBookings: BookingRecord[] } | { ok: false; error: string } {
  const { ticket, artisanIdOrAny, dateStr, startMin } = params;

  let resolvedArtisanId = artisanIdOrAny;
  if (artisanIdOrAny === 'any') {
    const availableArtisan = ARTISANS.find(
      (a) => evaluateArtisanSlot(existingBookings, a.id, dateStr, ticket, startMin).available
    );
    if (!availableArtisan) {
      return {
        ok: false,
        error: 'All private suites became occupied for this time block. Please choose the suggested open slot.',
      };
    }
    resolvedArtisanId = availableArtisan.id;
  } else {
    const check = evaluateArtisanSlot(existingBookings, resolvedArtisanId, dateStr, ticket, startMin);
    if (!check.available) {
      return {
        ok: false,
        error: check.conflictReason || 'Selected time block conflicts with an existing reservation.',
      };
    }
  }

  const refNum = Math.floor(1000 + Math.random() * 9000);
  const booking: BookingRecord = {
    id: `bk-${Date.now()}-${refNum}`,
    reference: `#SOL-${refNum}`,
    ticketId: ticket.id,
    serviceName: ticket.serviceName,
    requiredDurationMinutes: ticket.requiredDurationMinutes,
    bufferMinutes: ticket.bufferMinutes,
    artisanId: resolvedArtisanId,
    dateStr,
    startMin,
    serviceEndMin: startMin + ticket.requiredDurationMinutes,
    bufferEndMin: startMin + ticket.requiredDurationMinutes + ticket.bufferMinutes,
    guestName: params.guestName.trim(),
    guestEmail: params.guestEmail.trim(),
    guestPhone: params.guestPhone.trim(),
    quietAppointment: params.quietAppointment,
    teaPreference: params.teaPreference,
    isSeeded: false,
  };

  return {
    ok: true,
    booking,
    nextBookings: [...existingBookings, booking],
  };
}
