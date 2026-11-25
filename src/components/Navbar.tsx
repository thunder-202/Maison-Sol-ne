import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenScheduleView: () => void;
  activeReservationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenScheduleView,
  activeReservationCount,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '#sanctuary', label: 'Sanctuary' },
    { href: '#menu', label: 'Rituals' },
    { href: '#artisans', label: 'Artisans' },
    { href: '#consultation', label: 'Matcher' },
  ];

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <aside
        aria-label="Sanctuary Availability Notice"
        className="bg-linen border-b border-hairline py-2 px-4 text-center text-[11px] tracking-widest text-taupe uppercase font-medium"
      >
        Accepting Appointments for Autumn / Winter 2026 &middot; Private Suites Available
      </aside>

      <header className="sticky top-0 z-40 bg-alabaster/95 backdrop-blur-md border-b border-hairline">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 md:h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden p-2 -ml-2 text-espresso hover:text-champagne transition-colors"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <a
              href="#"
              className="text-xl md:text-2xl font-serif tracking-widest font-light text-espresso uppercase whitespace-nowrap shrink-0"
            >
              MAISON SOLÈNE
            </a>
          </div>

          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest text-taupe font-medium"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-espresso hover-underline-glide transition-colors py-1 whitespace-nowrap shrink-0"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={onOpenScheduleView}
              className="hover:text-espresso hover-underline-glide transition-colors py-1 whitespace-nowrap shrink-0 uppercase tracking-widest cursor-pointer"
            >
              Calendar{activeReservationCount > 0 ? ` (${activeReservationCount})` : ''}
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onOpenBooking}
              className="px-5 py-2.5 text-xs uppercase tracking-widest border border-hairline text-espresso hover:bg-espresso hover:text-alabaster hover:border-espresso transition-silk font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reserve Chair
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-hairline bg-alabaster px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="block text-sm uppercase tracking-widest text-espresso font-medium py-1.5"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                handleNavClick();
                onOpenScheduleView();
              }}
              className="block w-full text-left text-sm uppercase tracking-widest text-espresso font-medium py-1.5"
            >
              Suite Calendar{activeReservationCount > 0 ? ` (${activeReservationCount})` : ''}
            </button>
            <div className="pt-4 border-t border-hairline">
              <button
                type="button"
                onClick={() => {
                  handleNavClick();
                  onOpenBooking();
                }}
                className="w-full py-3 text-xs uppercase tracking-widest bg-espresso text-alabaster font-medium"
              >
                Reserve Private Chair
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
