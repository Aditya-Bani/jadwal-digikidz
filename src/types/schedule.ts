export type DayOfWeek = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

export type Coach = 'Mr. Bani' | 'Mr. Argy';

export type StudentLevel =
  | 'Little Creator 1'
  | 'Little Creator 2'
  | 'Junior 1'
  | 'Junior 2'
  | 'Teenager 1'
  | 'Teenager 2'
  | 'Teenager 3';

export type TimeSlot =
  | '08:00' | '09:00' | '10:00' | '11:00'
  | '12:00' | '13:00' | '14:00' | '15:00'
  | '16:00' | '17:00' | '18:00';

export interface ScheduleEntry {
  id: string;
  studentName: string;
  coach: Coach;
  level: StudentLevel;
  day: DayOfWeek;
  time: TimeSlot;
  isActive: boolean;
  inactiveReason?: string;
  notes?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export const DAYS: DayOfWeek[] = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'];

export const COACHES: Coach[] = ['Mr. Bani', 'Mr. Argy'];

export const LEVELS: StudentLevel[] = [
  'Little Creator 1', 'Little Creator 2',
  'Junior 1', 'Junior 2',
  'Teenager 1', 'Teenager 2', 'Teenager 3',
];

export const TIME_SLOTS: TimeSlot[] = [
  '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00'
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  senin: 'Senin',
  selasa: 'Selasa',
  rabu: 'Rabu',
  kamis: 'Kamis',
  jumat: "Jum'at",
  sabtu: 'Sabtu',
  minggu: 'Minggu'
};
