import React from 'react';
import { Check } from 'lucide-react';
import { ARTISANS } from '../data/sanctuaryData';
import { formatHumanDate, formatMinutesToTime } from '../lib/schedulingEngine';
import { BookingRecord } from '../types/scheduling';

interface ConfirmationModalProps {
  booking: BookingRecord | null;
  onClose: () => void;
  onViewCalendar: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  booking,
  onClose,
  onViewCalendar,
}) => {
  if (!booking) return null;

  const artisan = ARTISANS.find((a) => a.id === booking.artisanId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div onClick={onClose} className="absolute inset-0 drawer-backdrop" aria-hidden="true" />
      <div className="relative bg-alabaster border border-hairline p-8 md:p-10 max-w-lg w-full text-center space-y-6 z-10">
        <div className="w-12 h-12 rounded-full bg-linen border border-hairline flex items-center justify-center mx-auto text-champagne">
          <Check className="w-5 h-5" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-widest text-champagne font-semibold block">
            Reservation Confirmed &amp; Calendar Locked
          </span>
          <h3 id="confirm-modal-title" className="text-3xl font-serif text-espresso">
            We await your arrival.
          </h3>
          <p className="text-xs text-taupe leading-relaxed pt-1">
            Your private suite block and sanctuary turnover buffer are now locked in real time to
            guarantee unhurried solitude.
          </p>
        </div>

        <div className="p-5 bg-linen border border-hairline text-left text-xs space-y-2 text-taupe tabular-nums">
          <div className="flex justify-between gap-4">
            <span className="text-espresso font-medium">Reference</span>
            <span className="font-mono text-espresso">{booking.reference}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-espresso font-medium">Guest</span>
            <span>{booking.guestName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-espresso font-medium">Service Ticket</span>
            <span className="text-right">
              {booking.serviceName} ({booking.requiredDurationMinutes} mins)
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-espresso font-medium">Artisan &amp; Suite</span>
            <span>{artisan ? `${artisan.name} · ${artisan.suiteName}` : booking.artisanId}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-espresso font-medium">Locked Window</span>
            <span className="font-mono text-espresso">
              {formatHumanDate(booking.dateStr)} &middot; {formatMinutesToTime(booking.startMin)} –{' '}
              {formatMinutesToTime(booking.serviceEndMin)}
            </span>
          </div>
          <div className="flex justify-between gap-4 pt-2 border-t border-hairline">
            <span className="text-taupe">Turnover Buffer Locked</span>
            <span className="font-mono text-champagne">
              +{booking.bufferMinutes} mins ({formatMinutesToTime(booking.serviceEndMin)} –{' '}
              {formatMinutesToTime(booking.bufferEndMin)})
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onViewCalendar}
            className="flex-1 py-3 border border-hairline text-espresso text-xs uppercase tracking-widest font-medium hover:border-champagne transition-silk cursor-pointer"
          >
            Inspect Locked Calendar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-espresso text-alabaster text-xs uppercase tracking-widest font-medium hover:bg-champagne transition-silk cursor-pointer"
          >
            Return to Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
};
