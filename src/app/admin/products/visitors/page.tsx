import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
  const now = new Date();
  const dayAgo = new Date(now);
  dayAgo.setDate(now.getDate() - 1);

  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const monthAgo = new Date(now);
  monthAgo.setMonth(now.getMonth() - 1);

  const [daily, weekly, monthly] = await Promise.all([
    prisma.visit.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.visit.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.visit.count({ where: { gte: monthAgo } }),
  ]);

  const last10 = await prisma.visit.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return { daily, weekly, monthly, last10 };
}

export default async function AdminVisitorsPage() {
  const { daily, weekly, monthly, last10 } = await getStats();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin: Visitors</h1>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="bg-white/80 rounded-2xl p-3 border border-white/70">
          <p className="text-xs text-gray-500">Last 24 hours</p>
          <p className="text-xl font-semibold">{daily}</p>
        </div>
        <div className="bg-white/80 rounded-2xl p-3 border border-white/70">
          <p className="text-xs text-gray-500">Last 7 days</p>
          <p className="text-xl font-semibold">{weekly}</p>
        </div>
        <div className="bg-white/80 rounded-2xl p-3 border border-white/70">
          <p className="text-xs text-gray-500">Last 30 days</p>
          <p className="text-xl font-semibold">{monthly}</p>
        </div>
      </div>

      <div className="bg-white/80 rounded-2xl p-3 border border-white/70">
        <h2 className="font-semibold text-sm mb-2">Recent visits</h2>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b text-[11px] text-gray-600">
              <th className="py-1 px-2 text-left">Time</th>
              <th className="py-1 px-2 text-left">Path</th>
            </tr>
          </thead>
          <tbody>
            {last10.map(v => (
              <tr key={v.id} className="border-b last:border-b-0">
                <td className="py-1 px-2">
                  {format(new Date(v.createdAt), 'MMM d, HH:mm')}
                </td>
                <td className="py-1 px-2">
                  <Link href={v.path} className="text-pink-600 hover:underline">
                    {v.path}
                  </Link>
                </td>
              </tr>
            ))}
            {last10.length === 0 && (
              <tr>
                <td colSpan={2} className="py-3 text-center text-gray-500">
                  No visits yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
