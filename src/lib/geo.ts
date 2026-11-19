"use client";

/**
 * World geography for location pickers: every country (ISO 3166-1) with its
 * flag and official currency, and the states / provinces / regions of each
 * (ISO 3166-2), from the open country-state-city dataset.
 *
 * The data ships with the app (no API key, works offline in the PWA) but is
 * loaded lazily, only when a picker first renders, so it never weighs on the
 * feed or the landing page. The 8 MB city list is deliberately not imported.
 */
import { useEffect, useState } from "react";

export interface Country {
  name: string;
  code: string;
  flag: string;
  currency: string;
}
export interface Region {
  name: string;
  code: string;
}

interface Geo {
  countries: Country[];
  regionsByCountry: Map<string, Region[]>;
}

let cache: Promise<Geo> | null = null;

export function loadGeo(): Promise<Geo> {
  cache ??= Promise.all([
    import("country-state-city/lib/assets/country.json"),
    import("country-state-city/lib/assets/state.json"),
  ]).then(([c, s]) => {
    type RawC = { name: string; isoCode: string; flag: string; currency: string };
    type RawS = { name: string; isoCode: string; countryCode: string };
    const countries = ((c.default ?? c) as RawC[])
      .map((x) => ({ name: x.name, code: x.isoCode, flag: x.flag, currency: x.currency || "USD" }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const regionsByCountry = new Map<string, Region[]>();
    for (const r of (s.default ?? s) as RawS[]) {
      const list = regionsByCountry.get(r.countryCode) ?? [];
      list.push({ name: r.name, code: r.isoCode });
      regionsByCountry.set(r.countryCode, list);
    }
    for (const list of regionsByCountry.values()) list.sort((a, b) => a.name.localeCompare(b.name));
    return { countries, regionsByCountry };
  });
  return cache;
}

/** All countries plus a region lookup; null until the data has loaded. */
export function useGeo(): { countries: Country[]; regionsOf: (countryName: string) => Region[]; byName: (name: string) => Country | undefined } | null {
  const [geo, setGeo] = useState<Geo | null>(null);
  useEffect(() => {
    let alive = true;
    loadGeo().then((g) => alive && setGeo(g));
    return () => {
      alive = false;
    };
  }, []);
  if (!geo) return null;
  const byName = (name: string) => geo.countries.find((c) => c.name === name);
  return {
    countries: geo.countries,
    byName,
    regionsOf: (name) => {
      const c = byName(name);
      return c ? geo.regionsByCountry.get(c.code) ?? [] : [];
    },
  };
}

/** Best guess at the visitor's country from the browser locale (e.g. en-IN → India). Only a default; people can change it. */
export function guessCountryCode(): string | null {
  try {
    const loc = new Intl.Locale(navigator.language);
    return loc.maximize().region ?? null;
  } catch {
    return null;
  }
}
