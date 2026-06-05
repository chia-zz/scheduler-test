import { useApp } from '../context/AppContext';
import { monthLabel } from '../storage';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconCoffee,
  IconHelp,
  IconList,
  IconLogout,
  IconSettings,
  IconUsers,
} from './Icons';

const TABS = [
  { key: 'schedule', label: '排班', Icon: IconCalendar },
  { key: 'employees', label: '員工', Icon: IconUsers },
  { key: 'priorities', label: '班別順序', Icon: IconList },
  { key: 'settings', label: '設定', Icon: IconSettings },
  { key: 'help', label: '說明', Icon: IconHelp },
];

export default function Header({ tab, setTab, onLogout, onHome }) {
  const { data, stepMonth } = useApp();
  const month = data.ui.selectedMonth;

  return (
    <header className='sticky top-0 z-30 border-b border-line  bg-[rgba(252,250,244,0.92)] backdrop-blur'>
      <div className='mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3'>
        <button
          className='flex items-center gap-2 rounded-xl px-1 py-1 transition hover:bg-bg'
          onClick={onHome}
          title='回到月份首頁'
        >
          <span className='flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-bg text-primary-txt'>
            {/* <IconCoffee width={20} height={20} /> */}
            <img
              src={`${import.meta.env.BASE_URL}yet_logo.webp`}
              alt='yet_logo'
              width={20}
              height={20}
            />
          </span>
          <span className='hidden font-display text-lg font-semibold text-main sm:block'>
            排班小工具
          </span>
        </button>

        {/* month navigator */}
        <div className='flex items-center gap-1 rounded-xl border border-line bg-bg px-1 py-1'>
          <button
            className='btn-icon border-0 bg-transparent'
            onClick={() => stepMonth(-1)}
            aria-label='上個月'
          >
            <IconChevronLeft />
          </button>
          <span className='min-w-[6.5rem] text-center font-display text-sm font-semibold text-main'>
            {monthLabel(month)}
          </span>
          <button
            className='btn-icon border-0 bg-transparent'
            onClick={() => stepMonth(1)}
            aria-label='下個月'
          >
            <IconChevronRight />
          </button>
        </div>

        <button
          className='btn-icon'
          onClick={onLogout}
          title='登出'
          aria-label='登出'
        >
          <IconLogout width={16} height={16} />
        </button>
      </div>

      {/* tabs */}
      <nav className='mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-3 pb-2'>
        {TABS.map(({ key, label, Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-primary text-primary-txt shadow-soft'
                  : 'text-sub hover:bg-bg hover:text-main'
              }`}
            >
              <Icon width={16} height={16} />
              {label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
