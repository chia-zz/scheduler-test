import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { currentMonthKey } from '../storage';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCoffee,
  IconHelp,
  IconLogout,
  IconSettings,
} from './Icons';
import Footer from './Footer';

const pad = (n) => String(n).padStart(2, '0');

export default function HomePage({
  onOpenMonth,
  onHelp,
  onSettings,
  onLogout,
}) {
  const { data } = useApp();
  const todayKey = currentMonthKey();
  const todayYear = Number(todayKey.split('-')[0]);
  const selectedYear = Number(
    (data.ui.selectedMonth || todayKey).split('-')[0],
  );
  const [year, setYear] = useState(selectedYear);

  const monthsData = data.months || {};
  const isBuilt = (key) =>
    Object.keys(monthsData[key]?.schedule || {}).length > 0;

  return (
    <div className='min-h-screen bg-bg'>
      <header className='border-b border-line bg-[rgba(252,250,244,0.92)] backdrop-blur'>
        <div className='mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3'>
          <div className='flex items-center gap-2.5'>
            <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-txt'>
              <img
                src='/yet_logo_white.svg'
                alt='yet_logo'
                width={24}
                height={24}
                className='pt-1'
              />
            </span>
            <div>
              <div className='font-display text-lg font-bold leading-tight text-main'>
                排班小工具
              </div>
              <div className='text-xs text-sub'>選擇要編輯的月份</div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <button className='btn-ghost px-3 py-2' onClick={onHelp}>
              <IconHelp width={16} height={16} /> 說明
            </button>
            <button className='btn-ghost px-3 py-2' onClick={onSettings}>
              <IconSettings width={16} height={16} /> 設定
            </button>
            <button
              className='btn-icon'
              onClick={onLogout}
              title='登出'
              aria-label='登出'
            >
              <IconLogout width={16} height={16} />
            </button>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-[1100px] px-4 py-6'>
        <div className='mb-5 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <button
              className='btn-icon'
              onClick={() => setYear((y) => y - 1)}
              aria-label='上一年'
            >
              <IconChevronLeft />
            </button>
            <span className='min-w-[5rem] text-center font-display text-2xl font-bold text-main'>
              {year}
            </span>
            <button
              className='btn-icon'
              onClick={() => setYear((y) => y + 1)}
              aria-label='下一年'
            >
              <IconChevronRight />
            </button>
          </div>
          <button className='btn-ghost' onClick={() => setYear(todayYear)}>
            回到今年
          </button>
        </div>

        <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const key = `${year}-${pad(m)}`;
            const built = isBuilt(key);
            const isThisMonth = key === todayKey;
            return (
              <button
                key={key}
                onClick={() => onOpenMonth(key)}
                className={`card flex min-h-[104px] flex-col justify-between p-4 text-left transition hover:shadow-card hover:-translate-y-0.5 ${
                  isThisMonth ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className='flex items-start justify-between'>
                  <span className='font-display text-2xl font-bold text-main'>
                    {m}{' '}
                    <span className='text-base font-medium text-sub'>月</span>
                  </span>
                  {isThisMonth && (
                    <span className='text-[11px] font-medium text-primary'>
                      本月
                    </span>
                  )}
                </div>
                <span
                  className='tag w-fit'
                  style={
                    built
                      ? {
                          background: 'var(--c-success-bg)',
                          color: 'var(--c-success)',
                        }
                      : {
                          background: 'var(--c-bg)',
                          color: 'var(--c-text-sub)',
                        }
                  }
                >
                  {built ? '已建立' : '未建立'}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
