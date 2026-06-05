const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const IconChevronLeft = (p) => (
  <svg {...base} {...p}>
    <path d='M15 18l-6-6 6-6' />
  </svg>
);
export const IconChevronRight = (p) => (
  <svg {...base} {...p}>
    <path d='M9 18l6-6-6-6' />
  </svg>
);
export const IconUp = (p) => (
  <svg {...base} {...p}>
    <path d='M18 15l-6-6-6 6' />
  </svg>
);
export const IconDown = (p) => (
  <svg {...base} {...p}>
    <path d='M6 9l6 6 6-6' />
  </svg>
);
export const IconPlus = (p) => (
  <svg {...base} {...p}>
    <path d='M12 5v14M5 12h14' />
  </svg>
);
export const IconX = (p) => (
  <svg {...base} {...p}>
    <path d='M18 6L6 18M6 6l12 12' />
  </svg>
);
export const IconEdit = (p) => (
  <svg {...base} {...p}>
    <path d='M12 20h9' />
    <path d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z' />
  </svg>
);
export const IconTrash = (p) => (
  <svg {...base} {...p}>
    <path d='M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' />
  </svg>
);
export const IconUsers = (p) => (
  <svg {...base} {...p}>
    <path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' />
    <circle cx='9' cy='7' r='4' />
    <path d='M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
  </svg>
);
export const IconList = (p) => (
  <svg {...base} {...p}>
    <path d='M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' />
  </svg>
);
export const IconCalendar = (p) => (
  <svg {...base} {...p}>
    <rect x='3' y='4' width='18' height='18' rx='2' />
    <path d='M16 2v4M8 2v4M3 10h18' />
  </svg>
);
export const IconSettings = (p) => (
  <svg {...base} {...p}>
    <circle cx='12' cy='12' r='3' />
    <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z' />
  </svg>
);
export const IconLogout = (p) => (
  <svg {...base} {...p}>
    <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9' />
  </svg>
);
export const IconLock = (p) => (
  <svg {...base} {...p}>
    <rect x='3' y='11' width='18' height='11' rx='2' />
    <path d='M7 11V7a5 5 0 0 1 10 0v4' />
  </svg>
);
export const IconDownload = (p) => (
  <svg {...base} {...p}>
    <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3' />
  </svg>
);
export const IconUpload = (p) => (
  <svg {...base} {...p}>
    <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12' />
  </svg>
);
export const IconCheck = (p) => (
  <svg {...base} {...p}>
    <path d='M20 6L9 17l-5-5' />
  </svg>
);
export const IconCoffee = (p) => (
  <svg {...base} {...p}>
    <path d='M18 8h1a4 4 0 0 1 0 8h-1' />
    <path d='M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z' />
    <path d='M6 1v3M10 1v3M14 1v3' />
  </svg>
);
export const IconHome = (p) => (
  <svg {...base} {...p}>
    <path d='M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z' />
  </svg>
);
export const IconGrid = (p) => (
  <svg {...base} {...p}>
    <rect x='3' y='3' width='7' height='7' rx='1.5' />
    <rect x='14' y='3' width='7' height='7' rx='1.5' />
    <rect x='3' y='14' width='7' height='7' rx='1.5' />
    <rect x='14' y='14' width='7' height='7' rx='1.5' />
  </svg>
);
export const IconHelp = (p) => (
  <svg {...base} {...p}>
    <circle cx='12' cy='12' r='10' />
    <path d='M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3' />
    <path d='M12 17h.01' />
  </svg>
);
