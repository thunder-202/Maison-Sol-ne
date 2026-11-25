import { useEffect, useMemo, useState } from 'react';
import { ArtisansSection } from './components/ArtisansSection';
import { BookingDrawer, DrawerMode } from './components/BookingDrawer';
import { ConfirmationModal } from './components/ConfirmationModal';
import { HeroSection } from './components/HeroSection';
import { JournalAndFooter } from './components/JournalAndFooter';
import { MenuSection } from './components/MenuSection';
import { Navbar } from './components/Navbar';
import { SanctuarySection } from './components/SanctuarySection';
import { SensoryMatcher } from './components/SensoryMatcher';
import { createSeedBookings, getUpcomingOperatingDates } from './data/sanctuaryData';
import { BookingRecord } from './types/scheduling';

const STORAGE_KEY = 'maison_solene_bookings_v1';

function loadInitialBookings(): BookingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as BookingRecord[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to fresh seeded bookings
  }
  return createSeedBookings();
}

export default function App() {
  const [bookings, setBookings] = useState<BookingRecord[]>(loadInitialBookings);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('reserve');
  const [preselectedTicketId, setPreselectedTicketId] = useState<string | undefined>(undefined);
  const [preselectedArtisanId, setPreselectedArtisanId] = useState<string | undefined>(undefined);
  const [preselectedQuiet, setPreselectedQuiet] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  const defaultDateStr = useMemo(() => {
    const upcoming = getUpcomingOperatingDates(1);
    return upcoming[0] ?? new Date().toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      // Ignore storage quota errors
    }
  }, [bookings]);

  const openBooking = (opts?: {
    mode?: DrawerMode;
    ticketId?: string;
    artisanId?: string;
    quiet?: boolean;
  }) => {
    setDrawerMode(opts?.mode ?? 'reserve');
    setPreselectedTicketId(opts?.ticketId);
    setPreselectedArtisanId(opts?.artisanId);
    setPreselectedQuiet(Boolean(opts?.quiet));
    setDrawerOpen(true);
  };

  const handleBookingConfirmed = (booking: BookingRecord, nextBookings: BookingRecord[]) => {
    setBookings(nextBookings);
    setDrawerOpen(false);
    setConfirmedBooking(booking);
  };

  const handleReleaseBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const handleResetSchedule = () => {
    const fresh = createSeedBookings();
    setBookings(fresh);
  };

  const scrollToMatcher = () => {
    const el = document.getElementById('consultation');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const guestReservationCount = bookings.filter((b) => !b.isSeeded).length;

  return (
    <div className="min-h-screen bg-alabaster text-espresso font-sans antialiased bg-grain">
      <Navbar
        onOpenBooking={() => openBooking({ mode: 'reserve' })}
        onOpenScheduleView={() => openBooking({ mode: 'calendar' })}
        activeReservationCount={guestReservationCount}
      />

      <main>
        <HeroSection
          onOpenBooking={() => openBooking({ mode: 'reserve' })}
          onScrollToMatcher={scrollToMatcher}
        />

        <SanctuarySection />

        <SensoryMatcher
          bookings={bookings}
          defaultDateStr={defaultDateStr}
          onReserveRecommended={(ticketId, artisanId, quiet) =>
            openBooking({ mode: 'reserve', ticketId, artisanId, quiet })
          }
        />

        <MenuSection
          bookings={bookings}
          defaultDateStr={defaultDateStr}
          onSelectService={(ticketId) => openBooking({ mode: 'reserve', ticketId })}
        />

        <ArtisansSection
          bookings={bookings}
          defaultDateStr={defaultDateStr}
          onBookWithArtisan={(artisanId) => openBooking({ mode: 'reserve', artisanId })}
        />

        <JournalAndFooter onOpenBooking={() => openBooking({ mode: 'reserve' })} />
      </main>

      <BookingDrawer
        isOpen={drawerOpen}
        initialMode={drawerMode}
        initialTicketId={preselectedTicketId}
        initialArtisanId={preselectedArtisanId}
        initialQuiet={preselectedQuiet}
        defaultDateStr={defaultDateStr}
        bookings={bookings}
        onClose={() => setDrawerOpen(false)}
        onBookingConfirmed={handleBookingConfirmed}
        onReleaseBooking={handleReleaseBooking}
        onResetDemoSchedule={handleResetSchedule}
      />

      <ConfirmationModal
        booking={confirmedBooking}
        onClose={() => setConfirmedBooking(null)}
        onViewCalendar={() => {
          setConfirmedBooking(null);
          openBooking({ mode: 'calendar' });
        }}
      />
    </div>
  );
}
