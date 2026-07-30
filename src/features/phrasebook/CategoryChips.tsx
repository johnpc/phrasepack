import type { Chip } from './categoryFilter';
import './CategoryChips.css';

/** A horizontally-scrollable row of category filter chips. Controlled: the
 * parent owns the active slug. A tablist so screen readers announce the filter.
 * Hidden by the parent when there's only "All" (nothing to filter). */
export function CategoryChips({
  chips,
  active,
  onChange,
}: {
  chips: Chip[];
  active: string;
  onChange: (slug: string) => void;
}) {
  return (
    <div
      className="pp-chips"
      role="tablist"
      aria-label="Filter by category"
      data-testid="category-chips"
    >
      {chips.map((c) => (
        <button
          key={c.slug}
          role="tab"
          aria-selected={active === c.slug}
          className="pp-chip"
          data-active={active === c.slug}
          data-testid={`category-chip-${c.slug}`}
          onClick={() => onChange(c.slug)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
