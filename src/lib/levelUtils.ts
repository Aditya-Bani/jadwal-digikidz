import { ActivityReport } from '@/hooks/useActivityReports';

export interface LevelGroup {
  level: number;
  start: number;
  end: number;
  halfA: ActivityReport[];
  halfB: ActivityReport[];
}

export interface LevelGroupResponse {
  levels: LevelGroup[];
  trialReport?: ActivityReport;
}

/**
 * Groups activity reports by level (every 16 weeks = 1 level)
 * and splits each level into two halves of 8 weeks each.
 * Also captures trial reports (lessonWeek === 0).
 */
export function groupReportsByLevel(reports: ActivityReport[]): LevelGroupResponse {
  const sorted = [...reports].sort((a, b) => a.lessonWeek - b.lessonWeek);
  
  // Extract trial
  const trialReport = sorted.find(r => r.lessonWeek === 0);
  const actualReports = sorted.filter(r => r.lessonWeek > 0);
  
  const maxWeek = actualReports.length > 0 ? Math.max(...actualReports.map((r) => r.lessonWeek)) : 0;
  const totalLevels = Math.max(1, Math.ceil(maxWeek / 16));

  const levels = Array.from({ length: totalLevels }, (_, i) => {
    const start = i * 16 + 1;
    const end = (i + 1) * 16;
    const halfA = actualReports.filter((r) => r.lessonWeek >= start && r.lessonWeek <= start + 7);
    const halfB = actualReports.filter((r) => r.lessonWeek >= start + 8 && r.lessonWeek <= end);
    return { level: i + 1, start, end, halfA, halfB };
  });

  return { levels, trialReport };
}
