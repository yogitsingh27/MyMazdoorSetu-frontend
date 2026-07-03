import { cn } from '@/utils/cn';

// Single-select chip row (Trade, City) — clicking the active chip deselects
// it. Deliberately not multi-select: "Mason or Electrician" combinatorics
// aren't a real need yet, and single-select keeps the interaction obvious
// on a horizontally-scrolling mobile row.
export default function FilterChips({ options, selected, onSelect, getLabel = (o) => o }) {
  return (
    <div className="filter-chips">
      {options.map((opt) => {
        const isActive = selected === opt;
        return (
          <button
            key={opt}
            type="button"
            className={cn('filter-chip', isActive && 'active')}
            aria-pressed={isActive}
            onClick={() => onSelect(isActive ? null : opt)}
          >
            {getLabel(opt)}
          </button>
        );
      })}
    </div>
  );
}
