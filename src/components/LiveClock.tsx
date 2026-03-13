import { useState, useEffect } from 'react';
import { Clock, CalendarDays } from 'lucide-react';

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hari = HARI[now.getDay()];
  const tanggal = now.getDate();
  const bulan = BULAN[now.getMonth()];
  const tahun = now.getFullYear();

  const jam = String(now.getHours()).padStart(2, '0');
  const menit = String(now.getMinutes()).padStart(2, '0');
  const detik = String(now.getSeconds()).padStart(2, '0');

  return (
    <div className="flex items-center gap-4 text-muted-foreground">
      <div className="hidden sm:flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {hari}, {tanggal} {bulan} {tahun}
        </span>
      </div>
      <div className="hidden sm:block w-px h-4 bg-border" />

      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono font-semibold tabular-nums">
          {jam}:{menit}:{detik}
        </span>
      </div>
    </div>
  );
}
