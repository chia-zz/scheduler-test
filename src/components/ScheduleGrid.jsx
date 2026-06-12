import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar } from './Avatar';
import { SHIFT_MAP, WEEKDAY_SHORT, shiftHours } from '../constants';
import { buildWeeks, dayOfMonth, weekdayMon } from '../dateutils';
import {
  continuousWarnings,
  getDaySlots,
  isNationalHoliday,
} from '../scheduler';

export default function ScheduleGrid({ onEditCell }) {
  const { data, monthKey, currentMonth } = useApp();
  const month = currentMonth;
  const empById = useMemo(
    () => Object.fromEntries(data.employees.map((e) => [e.id, e])),
    [data.employees],
  );
  const warnings = useMemo(
    () => continuousWarnings(monthKey, month),
    [monthKey, month],
  );
  const weeks = buildWeeks(monthKey);

  const restingFulltimers = (date) =>
    data.employees.filter(
      (e) =>
        e.role === 'fulltime' &&
        (month.fulltimeRest?.[e.id] || []).includes(date),
    );

  function Chip({ date, slot }) {
    const cell = month.schedule?.[date]?.[slot.shiftKey];
    const emp = cell?.empId ? empById[cell.empId] : null;
    const start = cell?.start ?? slot.start;
    const end = cell?.end ?? slot.end;
    const holiday = isNationalHoliday(month, date);
    const doubled = holiday && emp?.role === 'parttime';
    const flagged = emp && warnings[emp.id]?.has(date);
    const label = SHIFT_MAP[slot.shiftKey].short;

    if (!emp) {
      return (
        <button
          onClick={() => onEditCell(date, slot.shiftKey, slot.start, slot.end)}
          className='flex w-full items-center justify-between rounded-md border border-dashed border-error bg-error-bg px-1.5 py-1 text-left text-[11px] text-error'
        >
          <span>{label}·未排</span>
          <span className='opacity-70'>{start}</span>
        </button>
      );
    }
    return (
      <button
        onClick={() => onEditCell(date, slot.shiftKey, slot.start, slot.end)}
        className='flex w-full items-center gap-1 rounded-md px-1.5 py-1.5 text-left text-[12px] leading-tight transition hover:brightness-95'
        style={{
          background: emp.color,
          color: '#32414C',
          boxShadow: flagged ? '0 0 0 2px var(--c-warning)' : 'none',
        }}
        title={flagged ? '連續上班超過 5 天' : undefined}
      >
        <span className='text-[13px]'>{emp.emoji}</span>
        <span className='min-w-0 flex-1'>
          <span className='block truncate font-semibold'>
            {label} {emp.name}
            {flagged ? ' ⚠️' : ''}
          </span>
          <span className='block opacity-80'>
            {start}–{end} ({shiftHours(start, end)}
            {doubled ? '×2' : ''})
          </span>
        </span>
      </button>
    );
  }

  function DayCell({ date }) {
    const closed = month.closedDays.includes(date);
    const holiday = month.holidays.find((h) => h.date === date);
    const slots = getDaySlots(data, month, date);
    const w = weekdayMon(date);
    const resting = restingFulltimers(date);
    return (
      <div className='min-h-[118px] rounded-xl border border-line bg-surface p-2 sm:min-h-[130px]'>
        <div className='mb-1 flex items-baseline justify-between'>
          <span
            className={`font-display text-sm font-semibold ${holiday || w >= 5 ? 'text-error' : 'text-main'}`}
          >
            {dayOfMonth(date)}
          </span>
          {holiday && (
            <span className='truncate text-[9px] text-error'>
              {holiday.name}
            </span>
          )}
        </div>
        {closed ? (
          <div className='rounded-md bg-error-bg px-1.5 py-2 text-center text-[11px] text-error'>
            公休
          </div>
        ) : (
          <div className='space-y-1'>
            {slots.map((s) => (
              <Chip key={s.shiftKey} date={date} slot={s} />
            ))}
            {resting.map((e) => (
              <div
                key={e.id}
                className='flex items-center gap-1 rounded-md bg-bg px-1.5 py-0.5 text-[10px] text-sub'
              >
                <Avatar emoji={e.emoji} color={e.color} size={14} /> {e.name} 休
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <div className='min-w-[760px]'>
        <div className='mb-1 grid grid-cols-7 gap-1.5'>
          {WEEKDAY_SHORT.map((wd, i) => (
            <div
              key={wd}
              className={`text-center text-xs font-semibold ${i >= 5 ? 'text-error' : 'text-sub'}`}
            >
              星期{wd}
            </div>
          ))}
        </div>
        <div className='space-y-1.5'>
          {weeks.map((week, wi) => (
            <div key={wi} className='grid grid-cols-7 gap-1.5'>
              {week.map((d, di) =>
                d ? <DayCell key={d} date={d} /> : <div key={di} />,
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
