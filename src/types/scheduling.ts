export type ServiceCategory = 'cut' | 'color' | 'spa';

export interface ServiceTicket {
  id: string;
  serviceName: string;
  category: ServiceCategory;
  requiredDurationMinutes: number;
  bufferMinutes: number;
  price: number;
  description: string;
  recommendedArtisans: string[];
}

export interface RawTicketPayload {
  id?: string;
  serviceName?: string;
  name?: string;
  requiredDurationMinutes?: number | string;
  duration?: number | string;
  price?: number;
}

export interface ExtractedTicketSpec {
  id: string;
  serviceName: string;
  requiredDurationMinutes: number;
  bufferMinutes: number;
  totalFootprintMinutes: number;
  price: number | null;
  source: 'catalog' | 'parsed-ticket';
}

export interface Artisan {
  id: string;
  name: string;
  role: string;
  experience: string;
  specialty: string;
  imagePath: string;
  suiteName: string;
}

export interface BookingRecord {
  id: string;
  reference: string;
  ticketId: string;
  serviceName: string;
  requiredDurationMinutes: number;
  bufferMinutes: number;
  artisanId: string;
  dateStr: string; // YYYY-MM-DD
  startMin: number; // minutes from midnight (e.g. 570 = 09:30)
  serviceEndMin: number;
  bufferEndMin: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  quietAppointment: boolean;
  teaPreference: string;
  isSeeded?: boolean;
}

export interface LockedCalendarBlock {
  booking: BookingRecord;
  startMin: number;
  serviceEndMin: number;
  bufferEndMin: number;
}

export interface CandidateSlotEvaluation {
  startMin: number;
  serviceEndMin: number;
  bufferEndMin: number;
  available: boolean;
  matchedArtisanId: string | null;
  conflictReason: string | null;
  precedingBufferApplied: boolean;
}

export interface NextOpenSlotSuggestion {
  found: boolean;
  dateStr: string;
  isDifferentDate: boolean;
  startMin: number;
  serviceEndMin: number;
  bufferEndMin: number;
  artisanId: string;
  explanation: string;
}

export interface GuestReflection {
  id: string;
  quote: string;
  guestName: string;
  ritualLabel: string;
}
