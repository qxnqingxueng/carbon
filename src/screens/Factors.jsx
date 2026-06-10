import { useState, useEffect } from 'react'
import { toast } from '../util.js'
import { api } from '../api.js'

const LABELS = [
  ['elec', 'Electricity (grid)', 'kg/kWh', '2', 's2'],
  ['diesel', 'Diesel', 'kg/L', '1', 's1'],
  ['gas', 'Natural gas', 'kg/m³', '1', 's1'],
  ['steel', 'Steel (cradle-to-gate)', 't/t', '3', 's3'],
]

export default function Factors() {
  const [f, setF] = useState({ elec: 0.74, diesel: 2.68, gas: 2.02, steel: 1.46 })
  useEffect(() => { api.getFactors().then(setF).catch(() => {}) }, [])

  const save = async () => {
    try {
      await api.saveFactors({ elec: +f.elec, diesel: +f.diesel, gas: +f.gas, steel: +f.steel })
      toast('Factors saved to your account', '✓')
    } catch (e) { toast('Save failed: ' + e.message, '⚠') }
  }

  return (
    <div className="content">
      <div className="page-head"><div><div className="eyebrow">✦ Reference</div><h2>Benchmarks &amp; <span>Factors</span></h2><p>Published lookup tables — not invented by us. Editable so you can match the latest official figure; saved per company.</p></div><button className="btn ghost" onClick={save}>Save factors</button></div>
      <div className="grid g2">
        <div className="card">
          <div className="sec-title">Emission factors in use</div><div className="sec-sub">Emissions = activity data × factor</div>
          <table className="rtable">
            <thead><tr><th>Source</th><th>Factor</th><th>Unit</th><th style={{ textAlign: 'right' }}>Scope</th></tr></thead>
            <tbody>
              {LABELS.map(([key, name, unit, scope, s]) => (
                <tr key={key}><td>{name}</td>
                  <td><input type="number" step="0.01" className="mono" value={f[key] ?? ''} onChange={e => setF(prev => ({ ...prev, [key]: e.target.value }))} style={{ width: 84, padding: '6px 9px', background: 'var(--panel2)', border: '1px solid var(--line2)', borderRadius: 8, color: 'var(--ink)' }} /></td>
                  <td>{unit}</td><td className="n"><span className={'tag ' + s}>{scope}</span></td></tr>
              ))}
            </tbody>
          </table>
          <div className="note amber">⚠ Grid factor figures of 0.69–0.77 have circulated. Verify the current value from the Energy Commission / MGTC. Fuel &amp; material factors from DEFRA / IPCC.</div>
        </div>
        <div className="card">
          <div className="sec-title">Benchmarks, not limits</div><div className="sec-sub">Metal stamping intensity reference</div>
          <table className="rtable"><thead><tr><th>Tier</th><th style={{ textAlign: 'right' }}>kg CO₂/part</th></tr></thead>
            <tbody>
              <tr><td>Best-in-class</td><td className="n">1.5</td></tr>
              <tr><td>Industry benchmark</td><td className="n">2.1</td></tr>
              <tr><td><b style={{ color: 'var(--ink)' }}>You (June 2026)</b></td><td className="n" style={{ color: 'var(--red)' }}>2.40</td></tr>
              <tr><td>Laggard</td><td className="n">3.0</td></tr>
            </tbody>
          </table>
          <div className="note">No single pass/fail "EU limit." CBAM uses commodity-code benchmarks per product: below = pay less, above = pay more. IFRS S2 has no benchmark; you just disclose.</div>
        </div>
      </div>
    </div>
  )
}
