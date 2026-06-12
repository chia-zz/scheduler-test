import { useApp } from '../context/AppContext';
import { Avatar } from './Avatar';

// 把同月份的日期（YYYY-MM-DD）壓成易讀字串：連續合併成區間，例如 "1, 7, 8, 22–30"
function compressDays(dates) {
  const days = [...new Set(dates.map((d) => Number(d.split('-')[2])))].sort(
    (a, b) => a - b,
  );
  const parts = [];
  let start = null;
  let prev = null;
  for (const d of days) {
    if (start === null) {
      start = prev = d;
      continue;
    }
    if (d === prev + 1) {
      prev = d;
      continue;
    }
    parts.push(start === prev ? `${start}` : `${start}–${prev}`);
    start = prev = d;
  }
  if (start !== null)
    parts.push(start === prev ? `${start}` : `${start}–${prev}`);
  return parts.join(', ');
}

export default function OffDaysPanel() {
  const { data, monthKey, currentMonth } = useApp();
  const month = currentMonth;
  const monthNum = Number(monthKey.split('-')[1]);

  const rows = data.employees
    .map((e) => {
      const u = month.unavailable?.[e.id] || {};
      const dates = Object.keys(u).filter((date) => u[date] === 'all');
      return dates.length ? { emp: e, text: compressDays(dates) } : null;
    })
    .filter(Boolean);

  return (
    <div className='card p-4'>
      <h3 className='mb-3 font-display text-base font-semibold text-main'>
        不能上班的日子（{monthNum} 月）
      </h3>
      {rows.length === 0 ? (
        <p className='text-xs text-sub'>本月尚無人填寫不可上班的日期。</p>
      ) : (
        <div className='space-y-1.5'>
          {rows.map(({ emp, text }) => (
            <div
              key={emp.id}
              className='flex items-start gap-2 rounded-xl bg-bg px-2.5 py-1.5'
            >
              <Avatar emoji={emp.emoji} color={emp.color} size={24} />
              <span className='mt-0.5 shrink-0 text-sm font-medium text-main'>
                {emp.name}
              </span>
              <span className='mt-0.5 text-xs leading-relaxed text-sub'>
                {text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
