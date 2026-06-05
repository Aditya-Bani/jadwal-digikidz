import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

export function LiveDateTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const timeFormatter = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div className="flex items-center gap-3 text-[#434655] font-semibold text-sm">
      <div className="flex items-center gap-2 text-[#004ac6]">
        <Calendar className="w-4 h-4" />
        <span className="text-[#434655]">{dateFormatter.format(time)}</span>
      </div>
      <div className="w-px h-4 bg-[#c3c6d7]"></div>
      <div className="flex items-center gap-2 text-[#004ac6]">
        <Clock className="w-4 h-4" />
        <span className="text-[#434655]">{timeFormatter.format(time).replace(/\./g, ':')}</span>
      </div>
    </div>
  );
}
