import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type TrackingParamsMap = Record<string, string>;

const TrackingParamsContext = createContext<TrackingParamsMap>({});

const SESSION_KEY = 'fruitfy_url_params_v1';

function parseSearch(search: string): TrackingParamsMap {
  const q = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(q);
  const out: TrackingParamsMap = {};
  params.forEach((value, key) => {
    const k = key.trim();
    if (!k || value === '') return;
    out[k] = value;
  });
  return out;
}

function readStoredParams(): TrackingParamsMap {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return { ...(parsed as TrackingParamsMap) };
  } catch {
    return {};
  }
}

function persistParams(next: TrackingParamsMap) {
  try {
    if (Object.keys(next).length === 0) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

function shallowEqualParams(a: TrackingParamsMap, b: TrackingParamsMap): boolean {
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

/** URL atual tem prioridade; o restante fica no backup da sessão (fluxo entre “páginas” / histórico). */
export function mergeUrlAndStoredParams(urlParams: TrackingParamsMap): TrackingParamsMap {
  const stored = readStoredParams();
  const merged = { ...stored, ...urlParams };
  if (Object.keys(merged).length > 0) persistParams(merged);
  return merged;
}

/** Monta o objeto `utm` da Fruitfy a partir de todos os query params da URL inicial. */
export function buildFruitfyUtmPayload(params: TrackingParamsMap): Record<string, string> | undefined {
  const keys = Object.keys(params);
  if (keys.length === 0) return undefined;
  return { ...params };
}

export function TrackingParamsProvider({ children }: { children: React.ReactNode }) {
  const [params, setParams] = useState<TrackingParamsMap>(() =>
    mergeUrlAndStoredParams(parseSearch(window.location.search)),
  );

  useEffect(() => {
    const syncFromLocation = () => {
      setParams((prev) => {
        const next = mergeUrlAndStoredParams(parseSearch(window.location.search));
        return shallowEqualParams(prev, next) ? prev : next;
      });
    };

    syncFromLocation();

    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, []);

  const value = useMemo(() => params, [params]);

  return (
    <TrackingParamsContext.Provider value={value}>
      {children}
    </TrackingParamsContext.Provider>
  );
}

export function useTrackingParams(): TrackingParamsMap {
  return useContext(TrackingParamsContext);
}
