import { useState, useEffect } from 'react';

export interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  types: string[];
}

const HOLIDAYS_2026: Holiday[] = [
  { date: '2026-01-01', localName: 'Tahun Baru Masehi', name: "New Year's Day", countryCode: 'ID', fixed: true, global: true, types: ['Public'] },
  { date: '2026-01-16', localName: 'Isra Mikraj Nabi Muhammad SAW', name: "Prophet Muhammad's Night Journey", countryCode: 'ID', fixed: false, global: true, types: ['Public'] },
  { date: '2026-02-16', localName: 'Cuti Bersama Tahun Baru Imlek', name: 'Chinese New Year Joint Leave', countryCode: 'ID', fixed: false, global: true, types: ['CommonLeave'] },
  { date: '2026-02-17', localName: 'Tahun Baru Imlek 2577 Kongzili', name: 'Chinese New Year', countryCode: 'ID', fixed: false, global: true, types: ['Public'] },
  { date: '2026-03-18', localName: 'Cuti Bersama Hari Suci Nyepi', name: 'Nyepi Joint Leave', countryCode: 'ID', fixed: false, global: true, types: ['CommonLeave'] },
  { date: '2026-03-19', localName: 'Hari Suci Nyepi (Tahun Baru Saka 1948)', name: 'Nyepi', countryCode: 'ID', fixed: false, global: true, types: ['Public'] },
  { date: '2026-03-20', localName: 'Cuti Bersama Idul Fitri 1447 H', name: 'Eid al-Fitr Joint Leave', countryCode: 'ID', fixed: false, global: true, types: ['CommonLeave'] },
  { date: '2026-03-21', localName: 'Hari Raya Idul Fitri 1447 H', name: 'Eid al-Fitr', countryCode: 'ID', fixed: false, global: true, types: ['Public'] },
  { date: '2026-03-22', localName: 'Hari Raya Idul Fitri 1447 H', name: 'Eid al-Fitr', countryCode: 'ID', fixed: false, global: true, types: ['Public'] },
  { date: '2026-03-23', localName: 'Cuti Bersama Idul Fitri 1447 H', name: 'Eid al-Fitr Joint Leave', countryCode: 'ID', fixed: false, global: true, types: ['CommonLeave'] },
  { date: '2026-03-24', localName: 'Cuti Bersama Idul Fitri 1447 H', name: 'Eid al-Fitr Joint Leave', countryCode: 'ID', fixed: false, global: true, types: ['CommonLeave'] },
  { date: '2026-04-03', localName: 'Wafat Yesus Kristus', name: 'Good Friday', countryCode: 'ID', fixed: false, global: true, types: ['Public'] },
  { date: '2026-04-05', localName: 'Kebangkitan Yesus Kristus (Paskah)', name: 'Easter Sunday', countryCode: 'ID', fixed: false, global: true, types: ['Public'] },
  { date: '2026-05-01', localName: 'Hari Buruh Internasional', name: 'Labour Day', countryCode: 'ID', fixed: true, global: true, types: ['Public'] },
  { date: '2026-05-14', localName: 'Kenaikan Yesus Kristus', name: 'Ascension Day', countryCode: 'ID', fixed: false, global: true, types: ['Public'] },
  { date: '2026-05-15', localName: 'Cuti Bersama Kenaikan Yesus Kristus', name: 'Ascension Day Joint Leave', countryCode: 'ID', fixed: false, global: true, types: ['CommonLeave'] },
  { date: '2026-05-27', localName: 'Idul Adha 1447 Hijriah', name: 'Eid al-Adha', countryCode: 'ID', fixed: false, global: true, types: ['Public'] },
  { date: '2026-05-28', localName: 'Cuti Bersama Idul Adha 1447 H', name: 'Eid al-Adha Joint Leave', countryCode: 'ID', fixed: false, global: true, types: ['CommonLeave'] },
  { date: '2026-05-31', localName: 'Hari Raya Waisak 2570 BE', name: 'Vesak Day', countryCode: 'ID', fixed: false, global: true, types: ['Public'] },
  { date: '2026-06-01', localName: 'Hari Lahir Pancasila', name: 'Pancasila Day', countryCode: 'ID', fixed: true, global: true, types: ['Public'] },
  { date: '2026-06-16', localName: 'Tahun Baru Islam 1448 Hijriah', name: 'Islamic New Year', countryCode: 'ID', fixed: false, global: true, types: ['Public'] },
  { date: '2026-08-17', localName: 'Hari Kemerdekaan RI', name: 'Independence Day', countryCode: 'ID', fixed: true, global: true, types: ['Public'] },
  { date: '2026-08-25', localName: 'Maulid Nabi Muhammad SAW', name: "Prophet Muhammad's Birthday", countryCode: 'ID', fixed: false, global: true, types: ['Public'] },
  { date: '2026-12-24', localName: 'Cuti Bersama Hari Raya Natal', name: 'Christmas Eve Joint Leave', countryCode: 'ID', fixed: true, global: true, types: ['CommonLeave'] },
  { date: '2026-12-25', localName: 'Hari Raya Natal', name: 'Christmas Day', countryCode: 'ID', fixed: true, global: true, types: ['Public'] },
];

export function useHolidays(year: number) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // If year 2026, use official government list (SKB 3 Menteri)
    if (year === 2026) {
      setHolidays(HOLIDAYS_2026);
      setLoading(false);
      return;
    }

    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ID`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Holiday[]) => {
        if (!cancelled) {
          setHolidays(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [year]);

  return { holidays, loading, error };
}
