"use client";

import { useGeo } from "@/lib/geo";
import { Field, selectCls } from "./ui";

export interface LocationValue {
  country: string;
  region: string;
  /** ISO 4217 code of the chosen country ("" when no country) */
  currency: string;
}

/**
 * Country + state/province picker over the full world list. Choosing a
 * country also reports its currency, which becomes the account's currency.
 */
export function LocationPicker({
  value,
  onChange,
  optional = true,
  regionLabel = "State / region",
}: {
  value: { country: string; region: string };
  onChange: (v: LocationValue) => void;
  optional?: boolean;
  regionLabel?: string;
}) {
  const geo = useGeo();
  const regions = geo && value.country ? geo.regionsOf(value.country) : [];
  const currencyOf = (name: string) => geo?.byName(name)?.currency ?? "";
  return (
    <div className="grid grid-cols-2 gap-2">
      <Field label="Country" optional={optional}>
        <select
          className={selectCls}
          value={value.country}
          disabled={!geo}
          onChange={(e) => onChange({ country: e.target.value, region: "", currency: currencyOf(e.target.value) })}
        >
          <option value="">{geo ? "Choose" : "Loading…"}</option>
          {/* keep a saved value visible even before the list loads */}
          {!geo && value.country && <option value={value.country}>{value.country}</option>}
          {geo?.countries.map((c) => (
            <option key={c.code} value={c.name}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={regionLabel} optional={optional}>
        <select
          className={selectCls}
          value={value.region}
          disabled={!value.country || !geo || regions.length === 0}
          onChange={(e) => onChange({ country: value.country, region: e.target.value, currency: currencyOf(value.country) })}
        >
          <option value="">{!value.country ? "Country first" : regions.length ? "Choose" : "None listed"}</option>
          {!geo && value.region && <option value={value.region}>{value.region}</option>}
          {regions.map((r) => (
            <option key={r.code + r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
