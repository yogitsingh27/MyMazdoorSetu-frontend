// Inline icon set — identical paths to the original prototype.
const PATHS = {
  hammer: 'M9 6l6 6-1.5 1.5L8 8 4 12l-1-1zM13 4l3 3-1.5 1.5L11.5 5.5z M14 8l5 5-2 2-5-5z',
  briefcase: 'M3 7h14v9H3z M7 7V5a2 2 0 012-2h2a2 2 0 012 2v2',
  user: 'M10 10a3 3 0 100-6 3 3 0 000 6zM4 17a6 6 0 0112 0',
  users: 'M6 10a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM13 10a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM2 16c0-3 2-4.5 4.5-4.5S11 13 11 16M9.5 11.7c1.6.2 4.5 1.4 4.5 4.3',
  shield: 'M10 2l7 3v5c0 5-3 7.5-7 8.5C6 17.5 3 15 3 10V5z',
  bell: 'M5 14h10l-1.5-2V8a3.5 3.5 0 10-7 0v4z M8 16a2 2 0 004 0',
  file: 'M5 2h6l4 4v12H5z M11 2v4h4',
  map: 'M3 5l4-1.5 6 1.5 4-1.5v11l-4 1.5-6-1.5-4 1.5z M7 3.5v11M13 5v11',
  check: 'M4 10l4 4 8-8',
  plus: 'M10 4v12M4 10h12',
  chart: 'M3 17V9M9 17V4M15 17v-7',
  search: 'M9 14a5 5 0 100-10 5 5 0 000 10zM17 17l-3.5-3.5',
  home: 'M3 10l7-6 7 6v8a1 1 0 01-1 1h-4v-6H8v6H4a1 1 0 01-1-1z',
  arrow: 'M4 10h12M11 5l5 5-5 5',
  message: 'M3 5h14v9H8l-3 3v-3H3z',
  card: 'M2 6h16v8H2z M2 9h16',
  star: 'M10 2l2.4 4.9 5.4.8-3.9 3.8.9 5.3L10 14.4 5.2 16.8l.9-5.3L2.2 7.7l5.4-.8z',
  cog: 'M10 7a3 3 0 100 6 3 3 0 000-6z M10 1v3M10 16v3M3 10H0M20 10h-3M5 5L3 3M17 17l-2-2M5 15l-2 2M17 3l-2 2',
  logout: 'M8 4H4v12h4 M13 13l3-3-3-3 M16 10H7',
  swap: 'M5 7h11l-3-3 M15 13H4l3 3',
  bookmark: 'M5 3h10v15l-5-3-5 3z',
  rupee: 'M6 4h8M6 8h8M12 4c0 4-3 5-6 5l6 7',
};

export default function Icon({ name, size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] || PATHS.user} />
    </svg>
  );
}
