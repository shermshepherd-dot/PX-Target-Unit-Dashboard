import { useState, useEffect } from 'react';
import Papa from 'papaparse';

// ── Sheet config ─────────────────────────────────────────────────────────────
// Each named tab is identified by its gid (sheet tab ID).
// To find gids: open the sheet, click each tab, look at the URL: ...#gid=XXXXXXXX
// The SHEET_ID is the long ID in the middle of your Google Sheet URL.

const SHEET_ID = '16Btge-zuEvShZYe0JbgHoKcPcF3mWkTppVs-cOKLhG8';

// Tab gid values — update these if you rename/reorder tabs in Google Sheets
// Format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}
const TABS = {
  houseWide:     '1413520131',  // House Wide Summary
  domainInsights:'269385517',   // Core Domain Monthly Insights
  baseline:      '1444138882',  // FY25 Baseline Data
  targetTables:  '174875802',   // Target_Unit_Tables
};

function csvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
}

async function fetchCsv(gid) {
  const res = await fetch(csvUrl(gid));
  if (!res.ok) throw new Error(`Failed to fetch tab gid=${gid}: ${res.status}`);
  const text = await res.text();
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject,
    });
  });
}

// ── Parsers ───────────────────────────────────────────────────────────────────

function parseHouseWide(rows) {
  // Expected columns: Division | Core Target Unit | Status | Failing Domains
  const results = [];
  for (const row of rows) {
    if (!row[0] || row[0].toLowerCase().includes('division') && row[1]?.toLowerCase().includes('core')) continue;
    if (row[2] && ['NEW TARGET','CONTINUED TARGET','IMPROVED'].includes(row[2].toUpperCase().trim())) {
      results.push({
        division: row[0].trim(),
        unit:     row[1].trim(),
        status:   row[2].trim().toUpperCase(),
        failing:  row[3]?.trim() || '—',
      });
    }
  }
  return results;
}

function parseDomainInsights(rows) {
  // Structure: unit name row, then 5 domain rows with baseline + current columns
  const DOMAIN_NAMES = ['Nurse Comm','Meds Comm','Discharge Info','Care Coord','Staff Response'];
  const units = {};
  let currentUnit = null;
  let domainIdx   = 0;

  for (const row of rows) {
    const first = row[0]?.trim();
    if (!first) continue;

    // Detect unit header rows (e.g. "3SCCT Telemetry", "5N", etc.)
    const isUnitRow = /^(3SCCT|5N|7S|5S|3N|7N|6N|4N|8S|8N)/i.test(first) &&
                      !row[3]; // unit rows have no data in col D

    if (isUnitRow) {
      currentUnit = first.replace('Telemetry','').replace('(OBGYN)','').trim();
      domainIdx   = 0;
      units[currentUnit] = { label: first.trim(), domains: [] };
      continue;
    }

    // Domain rows: col C = baseline, col D = current
    if (currentUnit && domainIdx < 5) {
      const baseline = parseFloat(row[3]);
      const current  = parseFloat(row[4]);
      if (!isNaN(baseline) && !isNaN(current)) {
        units[currentUnit].domains.push({
          name:     DOMAIN_NAMES[domainIdx],
          baseline: baseline,
          current:  current,
        });
        domainIdx++;
      }
    }
  }
  return units;
}

function parseTargetTables(rows) {
  // Each unit block: "Unit: XXXX" header row, then domain rows with score/threshold/gap/status
  const unitMap = {};
  let currentUnit = null;

  for (const row of rows) {
    const first = row[0]?.trim();
    if (!first) continue;

    // Unit header: "Unit: 3S CCT (Source: ...)" or "Unit: 5N ..."
    const unitMatch = first.match(/^Unit[:\s]+([^(]+)/i);
    if (unitMatch) {
      currentUnit = unitMatch[1].trim();
      unitMap[currentUnit] = { label: currentUnit, domains: [] };
      continue;
    }

    // Domain data row: col 0=domain, col 1=score, col 2=threshold, col 3=gap, col 4=status
    const score     = parseFloat(row[1]);
    const threshold = parseFloat(row[2]);
    const gap       = parseFloat(row[3]);
    const status    = row[4]?.trim();

    if (currentUnit && !isNaN(score) && status) {
      const cleanStatus = status.includes('Focus')    ? 'Focus Area'
                        : status.includes('Top')      ? 'Top Performing'
                        : status.includes('Watchlist')? 'Watchlist'
                        : status;
      unitMap[currentUnit].domains.push({
        name:      first,
        score:     score,
        threshold: threshold,
        gap:       gap,
        status:    cleanStatus,
      });
    }
  }
  return unitMap;
}

function parseBaseline(rows) {
  const results = [];
  for (const row of rows) {
    if (!row[0] || row[0].toLowerCase() === 'specialty') continue;
    const specialty = row[0]?.trim();
    const nSize     = row[1]?.trim();
    const unit      = row[2]?.trim();
    if (!unit) continue;
    results.push({
      specialty,
      nSize:          nSize ? parseInt(nSize) : null,
      unit,
      nurseComm:      parseFloat(row[3]) || null,
      medsComm:       parseFloat(row[4]) || null,
      dischargeInfo:  parseFloat(row[5]) || null,
      careCoord:      parseFloat(row[6]) || null,
      staffResponse:  parseFloat(row[7]) || null,
    });
  }
  return results;
}

// ── Merge into unified unit objects ──────────────────────────────────────────

function mergeUnitData(houseWide, domainInsights, targetTables, baseline) {
  const DIVISION_MAP = {};
  const N_MAP        = {};
  const STATUS_MAP   = {};

  for (const hw of houseWide) {
    const key = normalizeUnitKey(hw.unit);
    DIVISION_MAP[key] = hw.division;
    STATUS_MAP[key]   = hw.status;
  }
  for (const b of baseline) {
    const key = normalizeUnitKey(b.unit);
    if (b.nSize) N_MAP[key] = b.nSize;
  }

  // Build final units from targetTables (most granular data)
  const units = [];
  for (const [rawKey, ttData] of Object.entries(targetTables)) {
    const key      = normalizeUnitKey(rawKey);
    const insights = findInsights(domainInsights, rawKey);

    const domains = ttData.domains.map((d, i) => ({
      name:      normalizeDomainName(d.name),
      current:   d.score,
      threshold: d.threshold,
      gap:       d.gap,
      status:    d.status,
      baseline:  insights ? insights.domains[i]?.baseline ?? null : null,
    }));

    if (domains.length === 0) continue;

    units.push({
      id:       key,
      label:    rawKey.replace(' (Source:', '').split('(')[0].trim(),
      division: DIVISION_MAP[key] || 'Unknown',
      status:   STATUS_MAP[key]   || 'CONTINUED TARGET',
      n:        N_MAP[key]        || null,
      domains,
    });
  }

  return units;
}

function normalizeUnitKey(str) {
  return str.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/telemetry/g, '')
    .replace(/\(.*\)/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function normalizeDomainName(raw) {
  const r = raw.toLowerCase();
  if (r.includes('nurse') || r.includes('comm w/')) return 'Nurse Comm';
  if (r.includes('med') || r.includes('medicine')) return 'Meds Comm';
  if (r.includes('discharge')) return 'Discharge Info';
  if (r.includes('care') || r.includes('coord')) return 'Care Coord';
  if (r.includes('staff') || r.includes('response') || r.includes('responsiv')) return 'Staff Response';
  return raw;
}

function findInsights(insightsMap, unitLabel) {
  const key = normalizeUnitKey(unitLabel);
  for (const [k, v] of Object.entries(insightsMap)) {
    if (normalizeUnitKey(k) === key) return v;
  }
  return null;
}

// ── Main hook ─────────────────────────────────────────────────────────────────

export function useSheetData() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // Fetch all tabs in parallel
      const [hwRows, diRows, ttRows, blRows] = await Promise.all([
        fetchCsv(TABS.houseWide),
        fetchCsv(TABS.domainInsights),
        fetchCsv(TABS.targetTables),
        fetchCsv(TABS.baseline),
      ]);

      const houseWide      = parseHouseWide(hwRows);
      const domainInsights = parseDomainInsights(diRows);
      const targetTables   = parseTargetTables(ttRows);
      const baselineData   = parseBaseline(blRows);
      const units          = mergeUnitData(houseWide, domainInsights, targetTables, baselineData);

      setData({ houseWide, units, baselineData });
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return { data, loading, error, lastRefresh, refresh: load };
}
