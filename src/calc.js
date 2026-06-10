// GHG Protocol calculation engine. Pure functions — easy to unit-test and to port server-side later.
// Emissions = activity data x published emission factor.

export const FACTORS = { elec: 0.74, diesel: 2.68, gas: 2.02, steel: 1.46 } // kg/kWh, kg/L, kg/m3, t/t

export function compute(inp, suppliers, F = FACTORS) {
  const e = (+inp.elec || 0) * F.elec / 1000   // Scope 2 (t)
  const d = (+inp.diesel || 0) * F.diesel / 1000 // Scope 1
  const g = (+inp.gas || 0) * F.gas / 1000       // Scope 1
  const s = suppliers.reduce((a, x) => a + (+x.t || 0) * (x.f || F.steel), 0) // Scope 3
  const tot = e + d + g + s
  const parts = +inp.parts || 0
  const perPart = parts ? (tot * 1000 / parts) : 0
  const rows = [
    ['Electricity', 's2', e],
    ['Diesel (gen)', 's1', d],
    ['Natural gas', 's1', g],
    ['Materials (Scope 3)', 's3', s],
  ]
  const drivers = [
    ['Electricity', e, '#a3e635'],
    ['Materials (Scope 3)', s, '#b794f6'],
    ['Diesel', d, '#f59e0b'],
    ['Natural gas', g, '#56b6e6'],
  ].sort((a, b) => b[1] - a[1])
  return { e, d, g, s, tot, parts, perPart, rows, drivers }
}

// Scenario simulator: physical model for CO2, recommendation-aligned model for RM savings.
export function simulate(inp, suppliers, sim, F = FACTORS) {
  const c = compute(inp, suppliers, F)
  const scrapNow = +inp.scrap || 0
  const cut = Math.max(0, scrapNow - sim.scrapTgt) // percentage points
  const e2 = c.e * (1 - sim.solar / 100)
  const s2 = c.s * (1 - cut / 100)
  const projTot = e2 + c.d + c.g + s2
  const co2Saved = Math.max(0, (c.tot - projTot)) * 12 // annualised
  const rm = (sim.solar / 40) * 40000 + (sim.shift / 100) * 42000 + (cut / 3.5) * 21000
  return { projTot, projPerPart: c.parts ? projTot * 1000 / c.parts : 0, co2Saved, rm }
}

// naive keyword extraction for uploaded CSV/text (demo-level; backend does OCR/LLM)
const EXTRACT = [
  { id: 'elec', label: 'Electricity', unit: 'kWh', kw: /(electric|kwh|tnb|tenaga|penggunaan|consumption)/i, demo: 120000 },
  { id: 'diesel', label: 'Diesel (gen)', unit: 'L', kw: /(diesel|genset|generator)/i, demo: 3200 },
  { id: 'gas', label: 'Natural gas', unit: 'm³', kw: /(natural gas|\bgas\b|lng)/i, demo: 1500 },
  { id: 'parts', label: 'Production output', unit: 'parts', kw: /(part|output|production|unit|qty|quantity)/i, demo: 93500 },
  { id: 'scrap', label: 'Scrap rate', unit: '%', kw: /(scrap|reject|waste rate|yield loss)/i, demo: 9.5 },
]
function lineNumber(line) {
  let s = line.replace(/(\d),(\d{3})/g, '$1$2')
  if (s.includes(':')) s = s.split(':').slice(1).join(':')
  const m = s.match(/-?\d+(?:\.\d+)?/g)
  return m ? parseFloat(m[m.length - 1]) : null
}
export function parseText(txt) {
  const lines = txt.split(/\r?\n/)
  return EXTRACT.map(f => {
    let found = null
    for (const ln of lines) { if (f.kw.test(ln)) { const n = lineNumber(ln); if (n !== null) found = n } }
    return found !== null ? { ...f, val: found, conf: 'high' } : { ...f, val: f.demo, conf: 'low' }
  })
}
export function demoExtract() { return EXTRACT.map(f => ({ ...f, val: f.demo, conf: 'sim' })) }
