import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { monthLabel } from '../storage';
import { autoFulltimeRest } from '../scheduler';
import { bundledHolidaysForMonth } from '../holidays';
import {
  IconCalendar,
  IconCheck,
  IconDownload,
  IconList,
  IconSettings,
  IconUsers,
} from '../components/Icons';
import HolidayModal from '../components/HolidayModal';
import SpecialDaysModal from '../components/SpecialDaysModal';
import AvailabilityModal from '../components/AvailabilityModal';
import CellEditor from '../components/CellEditor';
import ScheduleGrid from '../components/ScheduleGrid';
import SidePanel from '../components/SidePanel';
import ExportModal from '../components/ExportModal';
import { Modal } from '../components/Avatar';

export default function SchedulePage() {
  const { data, monthKey, currentMonth, setMonth, autoSchedule } = useApp();
  const month = currentMonth;
  const [modal, setModal] = useState(null); // 'holiday' | 'special' | 'avail'
  const [editing, setEditing] = useState(null); // {date, shiftKey, defStart, defEnd}

  const fulltimers = data.employees.filter((e) => e.role === 'fulltime');
  const hasSchedule = Object.keys(month.schedule || {}).length > 0;

  // 首次進入某月時，先帶入內建國定假日（仍需使用者確認）
  useEffect(() => {
    if (!month.holidaysConfirmed && month.holidays.length === 0) {
      const proposed = bundledHolidaysForMonth(monthKey);
      if (proposed.length > 0)
        setMonth(monthKey, (m) => ({ ...m, holidays: proposed }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  function setRestTarget(empId, n) {
    setMonth(monthKey, (m) => ({
      ...m,
      fulltimeRestTarget: { ...m.fulltimeRestTarget, [empId]: n },
      fulltimeRest: {
        ...m.fulltimeRest,
        [empId]: autoFulltimeRest(
          data,
          { ...m, fulltimeRestTarget: { ...m.fulltimeRestTarget, [empId]: n } },
          monthKey,
          empId,
        ),
      },
    }));
  }

  function clearSchedule() {
    setMonth(monthKey, (m) => ({ ...m, schedule: {} }));
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h1 className='font-display text-xl font-bold text-main'>
          排班 · {monthLabel(monthKey)}
        </h1>
        <div className='flex flex-wrap gap-2'>
          <button className='btn-ghost' onClick={() => setModal('holiday')}>
            <IconCalendar width={15} height={15} /> 國定假日 (
            {month.holidays.length})
          </button>
          <button className='btn-ghost' onClick={() => setModal('special')}>
            <IconSettings width={15} height={15} /> 特殊日
          </button>
          <button className='btn-ghost' onClick={() => setModal('avail')}>
            <IconUsers width={15} height={15} /> 不可上班
          </button>
          <button
            className='btn-ghost'
            onClick={() => setModal('export')}
            disabled={!hasSchedule}
          >
            <IconDownload width={15} height={15} /> 匯出班表
          </button>
          <button
            className='btn-ghost lg:hidden'
            onClick={() => setModal('side')}
          >
            <IconList width={15} height={15} /> 統計 / 休假
          </button>
        </div>
      </div>

      {/* holiday confirm banner */}
      {!month.holidaysConfirmed && (
        <div className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-warning bg-warning-bg px-4 py-3 text-sm text-main'>
          <span>排班前請先確認本月國定假日（影響假日班別與兼職 ×2）。</span>
          <button
            className='btn-primary py-1.5'
            onClick={() => setModal('holiday')}
          >
            前往確認
          </button>
        </div>
      )}

      {/* controls */}
      <div className='card flex flex-wrap items-center gap-x-5 gap-y-3 p-3'>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-medium text-sub'>兼職時數平均</span>
          <div className='flex rounded-lg border border-line p-0.5'>
            <button
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${month.balanceMode ? 'bg-primary text-primary-txt' : 'text-sub'}`}
              onClick={() => setMonth(monthKey, { balanceMode: true })}
            >
              平均
            </button>
            <button
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${!month.balanceMode ? 'bg-primary text-primary-txt' : 'text-sub'}`}
              onClick={() => setMonth(monthKey, { balanceMode: false })}
            >
              照順序
            </button>
          </div>
        </div>

        {fulltimers.map((e) => (
          <div key={e.id} className='flex items-center gap-1.5'>
            <span className='text-xs text-sub'>{e.name} 月休</span>
            <input
              type='number'
              min={0}
              max={28}
              className='input w-16 px-2 py-1'
              value={month.fulltimeRestTarget?.[e.id] ?? 8}
              onChange={(ev) =>
                setRestTarget(e.id, Math.max(0, Number(ev.target.value) || 0))
              }
            />
            <span className='text-xs text-sub'>天</span>
          </div>
        ))}

        <div className='ml-auto flex gap-2'>
          {hasSchedule && (
            <button className='btn-ghost' onClick={clearSchedule}>
              清空
            </button>
          )}
          <button
            className='btn-primary'
            onClick={() => autoSchedule(monthKey)}
          >
            <IconCheck width={16} height={16} />{' '}
            {hasSchedule ? '重新自動排班' : '自動排班'}
          </button>
        </div>
      </div>

      {/* grid + summary */}
      <div className='flex flex-col gap-4 lg:flex-row'>
        <div className='min-w-0 flex-1'>
          {hasSchedule ? (
            <ScheduleGrid
              onEditCell={(date, shiftKey, defStart, defEnd) =>
                setEditing({ date, shiftKey, defStart, defEnd })
              }
            />
          ) : (
            <div className='card flex flex-col items-center gap-3 px-6 py-12 text-center'>
              <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-bg text-primary'>
                <IconList width={22} height={22} />
              </span>
              <p className='text-sm text-sub'>
                先確認國定假日、設定特殊日與不可上班，再按「自動排班」。
                <br />
                排好後可點任一格手動微調。
              </p>
              <button
                className='btn-primary'
                onClick={() => autoSchedule(monthKey)}
              >
                <IconCheck width={16} height={16} /> 自動排班
              </button>
            </div>
          )}
        </div>
        <aside className='hidden lg:block lg:w-[300px] lg:shrink-0'>
          <SidePanel />
        </aside>
      </div>

      <HolidayModal open={modal === 'holiday'} onClose={() => setModal(null)} />
      <SpecialDaysModal
        open={modal === 'special'}
        onClose={() => setModal(null)}
      />
      <AvailabilityModal
        open={modal === 'avail'}
        onClose={() => setModal(null)}
      />
      <ExportModal open={modal === 'export'} onClose={() => setModal(null)} />
      <Modal
        open={modal === 'side'}
        onClose={() => setModal(null)}
        title='統計與不能上班'
      >
        <SidePanel />
      </Modal>
      <CellEditor
        open={!!editing}
        date={editing?.date}
        shiftKey={editing?.shiftKey}
        defaultStart={editing?.defStart}
        defaultEnd={editing?.defEnd}
        onClose={() => setEditing(null)}
      />
    </div>
  );
}
