import OffDaysPanel from './OffDaysPanel';
import HoursSummary from './HoursSummary';

export default function SidePanel() {
  return (
    <div className='space-y-4'>
      <OffDaysPanel />
      <HoursSummary />
    </div>
  );
}
