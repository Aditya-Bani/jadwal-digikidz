import { ActivityReport } from '@/hooks/useActivityReports';

export interface LevelGroup {
  level: number;
  start: number;
  end: number;
  halfA: ActivityReport[];
  halfB: ActivityReport[];
}

/**
 * Groups activity reports by level (every 16 weeks = 1 level)
 * and splits each level into two halves of 8 weeks each.
 */
export function groupReportsByLevel(reports: ActivityReport[]): LevelGroup[] {
  const sorted = [...reports].sort((a, b) => a.lessonWeek - b.lessonWeek);
  const maxWeek = sorted.length > 0 ? Math.max(...sorted.map((r) => r.lessonWeek)) : 0;
  const totalLevels = Math.max(1, Math.ceil(maxWeek / 16));

  return Array.from({ length: totalLevels }, (_, i) => {
    const start = i * 16 + 1;
    const end = (i + 1) * 16;
    const halfA = sorted.filter((r) => r.lessonWeek >= start && r.lessonWeek <= start + 7);
    const halfB = sorted.filter((r) => r.lessonWeek >= start + 8 && r.lessonWeek <= end);
    return { level: i + 1, start, end, halfA, halfB };
  });
}
