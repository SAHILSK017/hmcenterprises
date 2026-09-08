"use client";

import { cn } from "@/lib/utils";
import {
  BATTERY_FILTERS,
  CATEGORY_FILTERS,
  CONDITION_FILTERS,
  PRICE_PRESETS,
  RAM_FILTERS,
  RATING_FILTERS,
  SHOP_BRANDS,
  STORAGE_FILTERS,
  WARRANTY_FILTERS,
} from "@/lib/shop";

export type ShopFiltersState = {
  brands: string[];
  conditions: string[];
  categories: string[];
  rams: string[];
  storages: string[];
  warranties: number[];
  batteryMin?: number;
  ratingMin?: number;
  minPrice?: number;
  maxPrice?: number;
  pricePreset?: string;
};

type Props = {
  value: ShopFiltersState;
  onChange: (next: ShopFiltersState) => void;
  onClear: () => void;
  className?: string;
};

function toggleInList<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-black/[0.06] py-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-foreground/50">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CheckRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground/75 hover:text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 rounded border-black/20 text-[#0071e3] focus:ring-[#0071e3]/30"
      />
      {label}
    </label>
  );
}

export function ShopFiltersPanel({ value, onChange, onClear, className }: Props) {
  const set = (patch: Partial<ShopFiltersState>) => onChange({ ...value, ...patch });

  return (
    <aside className={cn("rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1.5 rounded-full bg-[#1473EA]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#111827]">Filters</h2>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-bold text-[#1473EA] hover:underline"
        >
          CLEAR ALL
        </button>
      </div>

      <Section title="Brand">
        {SHOP_BRANDS.map((brand) => (
          <CheckRow
            key={brand}
            label={brand}
            checked={value.brands.includes(brand)}
            onChange={() => set({ brands: toggleInList(value.brands, brand) })}
          />
        ))}
      </Section>

      <Section title="Price">
        {PRICE_PRESETS.map((preset) => (
          <CheckRow
            key={preset.id}
            label={preset.label}
            checked={value.pricePreset === preset.id}
            onChange={() =>
              set({
                pricePreset: value.pricePreset === preset.id ? undefined : preset.id,
                minPrice: value.pricePreset === preset.id ? undefined : preset.min,
                maxPrice: value.pricePreset === preset.id ? undefined : preset.max,
              })
            }
          />
        ))}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={value.minPrice ?? ""}
            onChange={(e) =>
              set({
                pricePreset: undefined,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="h-9 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 text-sm font-medium outline-none focus:border-[#1473EA] focus:bg-white"
          />
          <input
            type="number"
            placeholder="Max ₹"
            value={value.maxPrice ?? ""}
            onChange={(e) =>
              set({
                pricePreset: undefined,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="h-9 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 text-sm font-medium outline-none focus:border-[#1473EA] focus:bg-white"
          />
        </div>
      </Section>

      <Section title="Condition">
        {CONDITION_FILTERS.map((c) => (
          <CheckRow
            key={c.value}
            label={c.label}
            checked={value.conditions.includes(c.value)}
            onChange={() => set({ conditions: toggleInList(value.conditions, c.value) })}
          />
        ))}
      </Section>

      <Section title="Category">
        {CATEGORY_FILTERS.map((c) => (
          <CheckRow
            key={c.value}
            label={c.label}
            checked={value.categories.includes(c.value)}
            onChange={() => set({ categories: toggleInList(value.categories, c.value) })}
          />
        ))}
      </Section>

      <Section title="RAM">
        {RAM_FILTERS.map((ram) => (
          <CheckRow
            key={ram}
            label={ram}
            checked={value.rams.includes(ram)}
            onChange={() => set({ rams: toggleInList(value.rams, ram) })}
          />
        ))}
      </Section>

      <Section title="Storage">
        {STORAGE_FILTERS.map((storage) => (
          <CheckRow
            key={storage}
            label={storage}
            checked={value.storages.includes(storage)}
            onChange={() => set({ storages: toggleInList(value.storages, storage) })}
          />
        ))}
      </Section>

      <Section title="Battery Health">
        {BATTERY_FILTERS.map((b) => (
          <CheckRow
            key={b.value}
            label={b.label}
            checked={value.batteryMin === b.value}
            onChange={() =>
              set({ batteryMin: value.batteryMin === b.value ? undefined : b.value })
            }
          />
        ))}
      </Section>

      <Section title="Warranty">
        {WARRANTY_FILTERS.map((w) => (
          <CheckRow
            key={w.value}
            label={w.label}
            checked={value.warranties.includes(w.value)}
            onChange={() => set({ warranties: toggleInList(value.warranties, w.value) })}
          />
        ))}
      </Section>

      <Section title="Rating">
        {RATING_FILTERS.map((r) => (
          <CheckRow
            key={r.value}
            label={r.label}
            checked={value.ratingMin === r.value}
            onChange={() =>
              set({ ratingMin: value.ratingMin === r.value ? undefined : r.value })
            }
          />
        ))}
      </Section>

      <button
        type="button"
        onClick={onClear}
        className="mt-6 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-2.5 text-sm font-bold text-[#64748B] hover:bg-[#EFF6FF] hover:text-[#1473EA] hover:border-[#1473EA]/30 transition-colors"
      >
        Clear All Filters
      </button>
    </aside>
  );
}
