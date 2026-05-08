import { useState } from 'react';
import { X } from 'lucide-react';
import { HolidayBanner } from '@/hooks/useHolidayBanners';

interface HolidayBannerPopupProps {
  banner: HolidayBanner;
}

export function HolidayBannerPopup({ banner }: HolidayBannerPopupProps) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={banner.name}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md animate-fade-in">
        {/* Close Button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute -top-3 -right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-xl border border-gray-100 text-gray-600 hover:text-red-500 hover:scale-110 transition-all duration-200 group"
          aria-label="Tutup popup"
        >
          <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
        </button>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl shadow-2xl shadow-black/30 border border-white/10 bg-white">
          {/* Banner Image */}
          <div className="relative w-full">
            <img
              src={banner.imageUrl}
              alt={banner.name}
              className="w-full object-cover max-h-[70vh]"
              style={{ display: 'block' }}
            />

          </div>
        </div>
      </div>
    </div>
  );
}
