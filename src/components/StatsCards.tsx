import { Users, UserCheck, Clock } from 'lucide-react';
import { ScheduleEntry, COACHES } from '@/types/schedule';

interface StatsCardsProps {
  schedule: ScheduleEntry[];
}

export function StatsCards({ schedule }: StatsCardsProps) {
  const totalStudents = new Set(schedule.map((e) => e.studentName)).size;
  const coachStats = COACHES.map((coach) => ({
    name: coach,
    count: schedule.filter((e) => e.coach === coach).length,
  }));
  const totalSessions = schedule.length;

  const stats = [
    {
      icon: Users,
      label: 'Total Murid Aktif',
      value: totalStudents,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
    },
    {
      icon: UserCheck,
      label: coachStats[0]?.name ?? 'Coach 1',
      value: `${coachStats[0]?.count ?? 0} Sesi`,
      colorClass: 'text-indigo-600',
      bgClass: 'bg-indigo-50',
    },
    {
      icon: UserCheck,
      label: coachStats[1]?.name ?? 'Coach 2',
      value: `${coachStats[1]?.count ?? 0} Sesi`,
      colorClass: 'text-purple-600',
      bgClass: 'bg-purple-50',
    },
    {
      icon: Clock,
      label: 'Sesi Terjadwal',
      value: totalSessions,
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 group cursor-default"
        >
          <div className="flex flex-col gap-4">
            {/* Icon header */}
            <div className="flex items-center justify-between">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgClass} dark:bg-opacity-10 transition-transform duration-300 group-hover:scale-110`}
              >
                <stat.icon className={`w-6 h-6 ${stat.colorClass} dark:brightness-125`} />
              </div>
            </div>

            {/* Value text */}
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
