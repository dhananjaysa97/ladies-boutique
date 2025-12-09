import { prisma } from '@/lib/prisma';
import { startOfDay, subDays } from 'date-fns';

async function getVisitorStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = subDays(todayStart, 7);
  const monthStart = subDays(todayStart, 30);

  const [today, week, month, all] = await Promise.all([
    prisma.visit.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.visit.count({
      where: { createdAt: { gte: weekStart } },
    }),
    prisma.visit.count({
      where: { createdAt: { gte: monthStart } },
    }),
    prisma.visit.count(),
  ]);

  // Last 10 visits
  const recent = await prisma.visit.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return { today, week, month, all, recent };
}

export default async function VisitorsAdminPage() {
  const stats = await getVisitorStats();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Visitors</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 rounded-2xl border border-white/70 shadow-sm p-4">
          <p className="text-xs text-gray-500">Today</p>
          <p className="text-xl font-semibold">{stats.today}</p>
        </div>
        <div className="bg-white/80 rounded-2xl border border-white/70 shadow-sm p-4">
          <p className="text-xs text-gray-500">Last 7 days</p>
          <p className="text-xl font-semibold">{stats.week}</p>
        </div>
        <div className="bg-white/80 rounded-2xl border border-white/70 shadow-sm p-4">
          <p className="text-xs text-gray-500">Last 30 days</p>
          <p className="text-xl font-semibold">{stats.month}</p>
        </div>
        <div className="bg-white/80 rounded-2xl border border-white/70 shadow-sm p-4">
          <p className="text-xs text-gray-500">All time</p>
          <p className="text-xl font-semibold">{stats.all}</p>
        </div>
      </div>

      <div className="bg-white/80 rounded-2xl border border-white/70 shadow-sm p-4">
        <h2 className="font-semibold text-sm mb-2">Recent visits</h2>
        <table className="w-full text-xs border-separate border-spacing-y-1">
          <thead className="text-[11px] text-gray-500">
            <tr>
              <th className="text-left">Time</th>
              <th className="text-left">Path</th>
              <th className="text-left">Session</th>
              <th className="text-left">User Agent</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.map(v => (
              <tr key={v.id}>
                <td className="pr-2 align-top">
                  {v.createdAt.toISOString().slice(0, 19).replace('T', ' ')}
                </td>
                <td className="pr-2 align-top">{v.path}</td>
                <td className="pr-2 align-top text-gray-500">
                  {v.sessionId?.slice(0, 8)}…
                </td>
                <td className="align-top text-gray-500 truncate max-w-xs">
                  {v.userAgent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
