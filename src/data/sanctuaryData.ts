import { Artisan, BookingRecord, GuestReflection, ServiceTicket } from '../types/scheduling';

export const SANCTUARY_OPEN_MIN = 9 * 60; // 09:00
export const SANCTUARY_CLOSE_MIN = 19 * 60; // 19:00
export const SLOT_INCREMENT_MIN = 15;

export const SERVICE_TICKETS: ServiceTicket[] = [
  {
    id: 'TKT-CUT-01',
    serviceName: 'Signature Dry Sculpt & Restyle',
    category: 'cut',
    requiredDurationMinutes: 75,
    bufferMinutes: 15,
    price: 145,
    description:
      'Tailored organic dry cut designed around natural hair growth patterns, texture mapping, and bone structure. Includes botanical shampoo and custom blowout.',
    recommendedArtisans: ['solene', 'julien'],
  },
  {
    id: 'TKT-CUT-02',
    serviceName: 'Editorial Transformation Sculpt',
    category: 'cut',
    requiredDurationMinutes: 105,
    bufferMinutes: 15,
    price: 190,
    description:
      'Complete shape reimagining from long to architectural short crop or textured bob. Includes preliminary strand analysis and scalp detox rinse.',
    recommendedArtisans: ['solene'],
  },
  {
    id: 'TKT-CUT-03',
    serviceName: 'Fringe & Silhouette Maintenance',
    category: 'cut',
    requiredDurationMinutes: 35,
    bufferMinutes: 10,
    price: 65,
    description:
      'Precision touch-up for existing face-framing layers and fringe between major restyling appointments.',
    recommendedArtisans: ['solene', 'julien'],
  },
  {
    id: 'TKT-CLR-01',
    serviceName: 'Sun-Lit Organic Balayage',
    category: 'color',
    requiredDurationMinutes: 180,
    bufferMinutes: 20,
    price: 285,
    description:
      'Hand-painted seamless dimension utilizing clay-based lighteners enriched with amino acid bond rebuilders. Seamless, low-maintenance grow-out.',
    recommendedArtisans: ['julien', 'solene'],
  },
  {
    id: 'TKT-CLR-02',
    serviceName: 'Cashmere Root Tint & Velvet Gloss',
    category: 'color',
    requiredDurationMinutes: 120,
    bufferMinutes: 15,
    price: 195,
    description:
      'Ammonia-free root coverage infused with organic argan and camellia extracts, followed by a customized tonal gloss for reflective luster.',
    recommendedArtisans: ['julien'],
  },
  {
    id: 'TKT-CLR-03',
    serviceName: 'Corrective Color & Tone Restoration',
    category: 'color',
    requiredDurationMinutes: 240,
    bufferMinutes: 20,
    price: 380,
    description:
      'Delicate multi-phase color repair for uneven, compromised tones. Includes restorative protein therapy and intensive home-care formula.',
    recommendedArtisans: ['julien'],
  },
  {
    id: 'TKT-SPA-01',
    serviceName: 'Camellia Scalp Detox & Aromatherapy Steam',
    category: 'spa',
    requiredDurationMinutes: 90,
    bufferMinutes: 15,
    price: 175,
    description:
      'Micro-exfoliating scalp scrub, warm herbal steam circulation, acupressure neck massage, and custom scalp microbiome tonic.',
    recommendedArtisans: ['elena'],
  },
  {
    id: 'TKT-SPA-02',
    serviceName: 'Pure Silk Keratin & Gua Sha Infusion',
    category: 'spa',
    requiredDurationMinutes: 105,
    bufferMinutes: 15,
    price: 210,
    description:
      'Cold-pressed botanical keratin seal infused with jade stone scalp Gua Sha to relieve tension and stimulate vascular hair follicle vitality.',
    recommendedArtisans: ['elena', 'solene'],
  },
];

export const ARTISANS: Artisan[] = [
  {
    id: 'solene',
    name: 'Solène Moreau',
    role: 'Founder & Creative Director',
    experience: '14 Years Experience · Paris & London',
    specialty: 'Architectural Dry Sculpting & Organic Balayage',
    imagePath: '/src/assets/images/artisan_solene_portrait_1795584772066.jpg',
    suiteName: 'Suite I — L’Orangerie',
  },
  {
    id: 'julien',
    name: 'Julien Vance',
    role: 'Master Colorist',
    experience: '11 Years Experience · Editorial & Session',
    specialty: 'Precision Tone Correction & Sun-Lit Highlights',
    imagePath: '/src/assets/images/artisan_julien_portrait_1795584772880.jpg',
    suiteName: 'Suite II — Travertine Atelier',
  },
  {
    id: 'elena',
    name: 'Elena Rostova',
    role: 'Head Spa Director',
    experience: '9 Years Experience · Scalp Therapist',
    specialty: 'Botanical Scalp Spa & Gua Sha Restorative Therapy',
    imagePath: '/src/assets/images/artisan_elena_portrait_1795584773355.jpg',
    suiteName: 'Suite III — Botanical Mist',
  },
];

export const HERO_IMAGE_PATH = '/src/assets/images/hero_sanctuary_interior_1795584771242.jpg';

export const BOTANICAL_TEAS: string[] = [
  'Jasmine Silver Needle White Tea',
  'Wild Organic Chamomile & Lavender',
  'Rose Petal & White Peach Elixir',
  'Sparkling Botanical Mineral Water',
];

export const GUEST_REFLECTIONS: GuestReflection[] = [
  {
    id: 'ref-1',
    quote:
      'Finding a salon that respects quiet solitude without awkward forced small talk is rare. Solène’s private suite feels like a hidden museum gallery.',
    guestName: 'Lady Clara H.',
    ritualLabel: 'Dry Sculpt Guest',
  },
  {
    id: 'ref-2',
    quote:
      'The Botanical Head Spa transformed my chronic tension headache within 20 minutes. The warm herbal steam and jade stone work are restorative.',
    guestName: 'Dr. Aris Thorne',
    ritualLabel: 'Head Spa Ritual',
  },
  {
    id: 'ref-3',
    quote:
      'My balayage grew out for six months seamlessly without any harsh line of demarcation. Truly master-level color chemistry.',
    guestName: 'V. Montgomery',
    ritualLabel: 'Balayage Guest',
  },
];

function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getUpcomingOperatingDates(count = 5): string[] {
  const dates: string[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);

  while (dates.length < count) {
    const day = cursor.getDay(); // 0=Sun, 1=Mon, 2=Tue ... 6=Sat
    if (day >= 2 && day <= 6) {
      dates.push(formatDateYMD(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function createSeedBookings(): BookingRecord[] {
  const operatingDays = getUpcomingOperatingDates(5);
  const [day1, day2, day3] = operatingDays;

  const makeSeed = (
    id: string,
    reference: string,
    ticketId: string,
    artisanId: string,
    dateStr: string,
    startMin: number,
    guestName: string
  ): BookingRecord => {
    const ticket = SERVICE_TICKETS.find((t) => t.id === ticketId) ?? SERVICE_TICKETS[0];
    return {
      id,
      reference,
      ticketId: ticket.id,
      serviceName: ticket.serviceName,
      requiredDurationMinutes: ticket.requiredDurationMinutes,
      bufferMinutes: ticket.bufferMinutes,
      artisanId,
      dateStr,
      startMin,
      serviceEndMin: startMin + ticket.requiredDurationMinutes,
      bufferEndMin: startMin + ticket.requiredDurationMinutes + ticket.bufferMinutes,
      guestName,
      guestEmail: 'private.guest@maisonsolene.com',
      guestPhone: '+44 20 7946 0000',
      quietAppointment: true,
      teaPreference: BOTANICAL_TEAS[0],
      isSeeded: true,
    };
  };

  const seeds: BookingRecord[] = [];
  if (day1) {
    // Day 1: morning and midday locks across artisans so buffer gaps & next open slots are immediately visible
    seeds.push(
      makeSeed('seed-1', '#SOL-4102', 'TKT-CUT-01', 'solene', day1, 9 * 60 + 30, 'C. Beaumont'),
      makeSeed('seed-2', '#SOL-4108', 'TKT-CUT-02', 'solene', day1, 13 * 60 + 30, 'M. Laurent'),
      makeSeed('seed-3', '#SOL-4114', 'TKT-CLR-01', 'julien', day1, 9 * 60, 'E. Ashworth'),
      makeSeed('seed-4', '#SOL-4119', 'TKT-CLR-02', 'julien', day1, 14 * 60 + 30, 'H. Sterling'),
      makeSeed('seed-5', '#SOL-4123', 'TKT-SPA-01', 'elena', day1, 10 * 60, 'A. Thorne'),
      makeSeed('seed-6', '#SOL-4129', 'TKT-SPA-02', 'elena', day1, 14 * 60, 'S. Kensington')
    );
  }
  if (day2) {
    seeds.push(
      makeSeed('seed-7', '#SOL-4201', 'TKT-CUT-02', 'solene', day2, 10 * 60, 'N. Devereux'),
      makeSeed('seed-8', '#SOL-4205', 'TKT-CLR-03', 'julien', day2, 9 * 60 + 30, 'L. Cavendish'),
      makeSeed('seed-9', '#SOL-4211', 'TKT-SPA-01', 'elena', day2, 11 * 60 + 30, 'K. Lindqvist')
    );
  }
  if (day3) {
    seeds.push(
      makeSeed('seed-10', '#SOL-4302', 'TKT-CUT-01', 'solene', day3, 11 * 60, 'G. Moretti'),
      makeSeed('seed-11', '#SOL-4309', 'TKT-SPA-02', 'elena', day3, 9 * 60 + 30, 'R. Valmont')
    );
  }

  return seeds;
}
