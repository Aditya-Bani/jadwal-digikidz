import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ScheduleEntry, COACHES } from '@/types/schedule';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface AnalyticsBentoProps {
    schedule: ScheduleEntry[];
}

export function AnalyticsBento({ schedule }: AnalyticsBentoProps) {
    const coachData = COACHES.map((coach) => ({
        name: coach.split('.')[1]?.trim() || coach,
        value: schedule.filter((e) => e.coach === coach).length,
        fullName: coach,
    }));

    const levels = ['Little Creator', 'Junior', 'Teenager'];
    const levelData = levels.map(level => ({
        name: level,
        count: schedule.filter(e => e.level.startsWith(level)).length
    }));

    // Clean Scholar Professional Colors
    const COLORS = ['#2563eb', '#8b5cf6', '#f59e0b', '#10b981']; // Blue 600, Violet 500, Amber 500, Emerald 500

    const CustomBarTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg">
                    <p className="text-xs uppercase font-bold text-slate-500 mb-1">
                        {payload[0].payload.fullName}
                    </p>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                        {payload[0].value} <span className="text-sm font-semibold text-slate-400">Sesi</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: payload[0].payload.fill }} />
                        <p className="text-xs uppercase font-bold text-slate-500">
                            {payload[0].name}
                        </p>
                    </div>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                        {payload[0].value} <span className="text-sm font-semibold text-slate-400">Sesi</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chart 1: Bar Chart Workload */}
            <div className="lg:col-span-2 glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl border border-blue-100 dark:border-blue-800">
                            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                                Coach Workload
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribusi sesi per pengajar</p>
                        </div>
                    </div>
                </div>

                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={coachData}>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                                dy={12}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                            />
                            <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} content={<CustomBarTooltip />} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={44}>
                                {coachData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === 0 ? COLORS[0] : COLORS[1]} // Blue for first, Violet for second
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: Pie Chart Levels */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <PieIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                            Level Ratio
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Persentase tingkat murid</p>
                    </div>
                </div>

                <div className="h-[200px] w-full flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={levelData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={6}
                                dataKey="count"
                                stroke="transparent" // Remove default white border
                            >
                                {levelData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                            {schedule.length}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Total
                        </span>
                    </div>
                </div>

                {/* Legend list */}
                <div className="mt-6 space-y-2">
                    {levelData.map((item, i) => (
                        <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ background: COLORS[i % COLORS.length] }}
                                />
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                    {item.name}
                                </span>
                            </div>
                            <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                                {item.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
