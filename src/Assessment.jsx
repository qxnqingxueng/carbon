import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { compute, simulate, FACTORS, parseText, demoExtract } from './calc.js'
import { exportPDF, exportWord } from './reports.js'
import { toast } from './util.js'
import { api } from './api.js'
import Modal from './Modal.jsx'

const STEPS = [
  { n: 1, lab: 'Input', sub: 'Activity data' },
  { n: 2, lab: 'Calculate', sub: 'GHG Protocol' },
  { n: 3, lab: 'Explain & Decide', sub: 'Benchmark · fixes · simulate' },
  { n: 4, lab: 'Detect', sub: 'Anomalies · Phase 2' },
  { n: 5, lab: 'Report', sub: 'IFRS S2 / CBAM' },
]
const CONNECTORS = [
  { name: 'SQL Account', cl: '🧾' }, { name: 'AutoCount', cl: '📒' },
  { name: 'QuickBooks', cl: '💼' }, { name: 'TNB myTNB', cl: '⚡' },
]
const ERPDATA = {
  'SQL Account': { elec: 131200, diesel: 3300, gas: 1580, parts: 94000 },
  'AutoCount': { elec: 126900, diesel: 3450, gas: 1610, parts: 92800 },
  'QuickBooks': { elec: 128400, diesel: 3400, gas: 1620, parts: 93500 },
  'TNB myTNB': { elec: 124500 },
}
const DETECT = [8, 7, 7, 7, 8, 11, 15, 19, 22, 24, 25, 24, 23, 22, 30, 33, 24, 21, 18, 15, 12, 10, 9, 8]

export default function Assessment({ onClose, onSaved }) {
  const saveToDb = async () => {
    try { const r = await api.saveAssessment({ period: 'June 2026', inputs: inp, suppliers }); toast('Saved to database (id ' + r.id + ')', '✓'); onSaved && onSaved() }
    catch (e) { toast('Save failed: ' + e.message, '⚠') }
  }
  const [step, setStep] = useState(1)
  const [inp, setInp] = useState({ elec: 120000, diesel: 3200, gas: 1500, parts: 93500, scrap: 9.5 })
  const [suppliers, setSuppliers] = useState([
    { name: 'SteelCo Penang', mat: 'Hot-rolled coil', t: 55, f: 1.46 },
    { name: 'MetalSource', mat: 'Cold-rolled sheet', t: 30, f: 1.46 },
  ])
  const [sim, setSim] = useState({ shift: 40, solar: 15, scrapTgt: 6 })
  const [repType, setRepType] = useState('ifrs')
  const [narr, setNarr] = useState({
    gov: "The Board's Sustainability Committee oversees climate-related risks, with quarterly review of emissions against benchmark.",
    strat: 'Primary transition risk is CBAM exposure on EU steel-part exports. Opportunity: energy-cost savings from load shifting and solar.',
    plan: 'Shift press load off-peak (Q3), pilot rooftop solar (Q4), reduce scrap 9.5%→6% via tooling review.',
  })
  const [extract, setExtract] = useState(null)
  const [connected, setConnected] = useState({})
  const [wizard, setWizard] = useState(null) // {name, phase:'auth'|'range'|'importing'|'preview', meter}

  const c = useMemo(() => compute(inp, suppliers), [inp, suppliers])
  const sm = useMemo(() => simulate(inp, suppliers, sim), [inp, suppliers, sim])

  const setField = (k, v) => setInp(s => ({ ...s, [k]: v }))
  const scopeData = [
    { name: 'Scope 1', value: +(c.d + c.g).toFixed(1), c: '#f59e0b' },
    { name: 'Scope 2', value: +c.e.toFixed(1), c: '#a3e635' },
    { name: 'Scope 3', value: +c.s.toFixed(1), c: '#b794f6' },
  ]

  /* ---- file upload extraction ---- */
  function handleFile(file) {
    if (!file) return
    const ext = (file.name.split('.').pop() || '').toLowerCase()
    const apply = (res) => {
      const next = { ...inp }
      res.forEach(r => { next[r.id] = r.val })
      setInp(next); setExtract({ name: file.name, res, sim: ext !== 'csv' && ext !== 'txt' })
      toast('Figures extracted from ' + file.name, '✓')
    }
    if (ext === 'csv' || ext === 'txt') {
      const r = new FileReader(); r.onload = e => apply(parseText(e.target.result)); r.readAsText(file)
    } else { apply(demoExtract()) }
  }

  /* ---- connector wizard ---- */
  function applyERP(name, meter) {
    setConnected(s => ({ ...s, [name]: true }))
    if (meter) { toast('Smart meter connected — anomaly detection enabled', '✓'); setWizard(null); return }
    const d = ERPDATA[name] || ERPDATA['QuickBooks']
    setInp(s => ({ ...s, ...d })); toast('Imported from ' + name + ' — fields updated', '✓'); setWizard(null)
  }
  function wizardActions() {
    const w = wizard
    if (w.phase === 'auth') return [
      { label: 'Cancel', kind: 'ghost', onClick: () => setWizard(null) },
      { label: 'Authorize at ' + w.name + ' ↗', onClick: () => { window.open('https://www.google.com/search?q=' + encodeURIComponent(w.name), '_blank', 'noopener'); setWizard({ ...w, phase: 'range' }) } },
    ]
    if (w.phase === 'range') return [
      { label: '← Back', kind: 'ghost', onClick: () => setWizard({ ...w, phase: 'auth' }) },
      { label: 'Import', onClick: () => { setWizard({ ...w, phase: 'importing' }); setTimeout(() => setWizard(x => x && { ...x, phase: 'preview' }), 1100) } },
    ]
    if (w.phase === 'preview') return [
      { label: 'Cancel', kind: 'ghost', onClick: () => setWizard(null) },
      { label: 'Apply', onClick: () => applyERP(w.name, w.meter) },
    ]
    return [{ label: 'Cancel', kind: 'ghost', onClick: () => setWizard(null) }]
  }
  function wizardBody() {
    const w = wizard, d = ERPDATA[w.name] || ERPDATA['QuickBooks']
    if (w.phase === 'auth') return <div className="wz"><p>You'll be redirected to <b>{w.name}</b> to sign in and grant read-only access:</p><ul className="wz-list"><li>{w.meter ? 'Interval meter readings (15-min)' : 'Invoices & utility expense lines'}</li><li>Billing periods & amounts</li></ul><p className="wz-note">Demo — opens {w.name} in a new tab; no real account is linked.</p></div>
    if (w.phase === 'range') return <div className="wz"><div className="field"><label>Import range</label><select><option>June 2026 (1 month)</option><option>Q2 2026 (3 months)</option><option>Last 12 months</option></select></div><p className="wz-note">We'll pull and map the records to activity data.</p></div>
    if (w.phase === 'importing') return <div className="wz" style={{ textAlign: 'center', padding: '22px 0' }}><span className="spinner" style={{ width: 30, height: 30 }} /><p style={{ marginTop: 14 }}>Fetching and mapping records…</p></div>
    return <div className="wz"><p><b>{w.name}</b> returned the following, mapped to your activity fields:</p><table className="wz-tbl"><tbody>
      <tr><td>Electricity</td><td className="n">{(d.elec || 0).toLocaleString()} kWh</td></tr>
      {d.diesel != null && <tr><td>Diesel</td><td className="n">{d.diesel.toLocaleString()} L</td></tr>}
      {d.gas != null && <tr><td>Natural gas</td><td className="n">{d.gas.toLocaleString()} m³</td></tr>}
      {d.parts != null && <tr><td>Output</td><td className="n">{d.parts.toLocaleString()} parts</td></tr>}
    </tbody></table></div>
  }

  const Banner = ({ total }) => (
    <div className="result-banner">
      <div><div className="lab">Total carbon footprint</div><div className="big">{c.tot.toFixed(1)}<small> tCO₂e</small></div></div>
      <div className="chips"><div className="chip">Per part<b>{c.perPart.toFixed(2)} kg</b></div><div className="chip">Method<b>GHG Protocol</b></div></div>
    </div>
  )
  const Breakdown = () => (
    <table className="rtable"><thead><tr><th>Source</th><th>Scope</th><th style={{ textAlign: 'right' }}>tCO₂e</th></tr></thead>
      <tbody>{c.rows.map((r, i) => <tr key={i}><td>{r[0]}</td><td><span className={'tag ' + r[1]}>{r[1].toUpperCase()}</span></td><td className="n">{r[2].toFixed(1)}</td></tr>)}</tbody>
      <tfoot><tr><td colSpan="2" style={{ fontWeight: 700, color: 'var(--ink)' }}>Total</td><td className="n">{c.tot.toFixed(1)}</td></tr></tfoot></table>
  )

  return (
    <div className="workspace">
      <div className="ws-bar">
        <div className="ws-back">
          <button className="bk" onClick={onClose}>←</button>
          <div className="tt"><b>June 2026 Assessment</b><span>Creative Bliss Sdn Bhd · Penang · Line A</span></div>
        </div>
        <div className="ws-acts">
          <span className="type-pill">Monthly data</span>
          <button className="btn ghost sm" onClick={saveToDb}>Save</button>
          <button className="btn sm" onClick={() => setStep(5)}>Generate report →</button>
        </div>
      </div>

      <div className="ws-body">
        <div className="ws-rail">
          <div className="rl">Assessment steps</div>
          {STEPS.map(s => (
            <button key={s.n} className={'ws-step' + (step === s.n ? ' active' : step > s.n ? ' done' : '')} onClick={() => setStep(s.n)}>
              <div className="sn">{s.n}</div><div><div className="lab">{s.lab}</div><div className="sub">{s.sub}</div></div>
            </button>
          ))}
        </div>

        <div className="ws-main">
          {step === 1 && (
            <div>
              <div className="step-h"><h3>Step 1 · Input</h3><p>Connect a system, upload a document, or type by hand. The total updates live.</p></div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="sec-title">Fastest: connect your data <span className="tag coach">auto spend → emissions</span></div>
                <div className="sec-sub">One click pulls activity data from where it already lives.</div>
                <div className="conn-grid">
                  {CONNECTORS.map(k => (
                    <div key={k.name} className={'conn' + (connected[k.name] ? ' connected' : '')} onClick={() => setWizard({ name: k.name, phase: 'auth', meter: false })}>
                      <div className="cl">{k.cl}</div><div className="cn">{k.name}</div><div className="cs">{connected[k.name] ? 'Connected ✓' : 'Connect'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="sec-title">Or upload a document <span className="tag coach">keyword extraction</span></div>
                <div className="sec-sub">Drop a TNB bill, supplier invoice or data export — we read it and fill the fields.</div>
                <label className="dropzone">
                  <div className="dz-ic">⬆</div><div style={{ flex: 1 }}><b>Click to browse</b><div className="dz-sub">PDF · CSV · XLSX · PNG/JPG</div></div>
                  <input type="file" style={{ display: 'none' }} accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.txt" onChange={e => handleFile(e.target.files[0])} />
                </label>
                {extract && (
                  <div style={{ marginTop: 16 }}>
                    <div className="ex-head"><span className="dot" /> Extracted from <b style={{ margin: '0 4px' }}>{extract.name}</b></div>
                    <div className="ex-chips">{extract.res.map((r, i) => <div key={i} className={'ex-chip' + (r.conf === 'low' ? ' low' : '')}><span className="ck">{r.conf === 'low' ? '⚠' : '✓'}</span> {r.label} → <b>{Number(r.val).toLocaleString()} {r.unit}</b></div>)}</div>
                    <div className="note" style={{ marginBottom: 0 }}>✎ {extract.sim ? 'Scanned/binary file — production runs OCR + matcher on the backend. Demo values shown; verify.' : 'Parsed from the file. ⚠ fields fell back to a default — check them.'} All columns stay editable.</div>
                  </div>
                )}
              </div>
              <div className="grid g2">
                <div className="card">
                  <div className="row2">
                    <div className="field"><label>Electricity (kWh)</label><input type="number" min="0" value={inp.elec} onChange={e => setField('elec', e.target.value)} /><div className="hint">Scope 2 · 0.74</div></div>
                    <div className="field"><label>Diesel — gen (L)</label><input type="number" min="0" value={inp.diesel} onChange={e => setField('diesel', e.target.value)} /><div className="hint">Scope 1 · 2.68</div></div>
                  </div>
                  <div className="row2">
                    <div className="field"><label>Natural gas (m³)</label><input type="number" min="0" value={inp.gas} onChange={e => setField('gas', e.target.value)} /><div className="hint">Scope 1 · 2.02</div></div>
                    <div className="field"><label>Output (parts)</label><input type="number" min="0" value={inp.parts} onChange={e => setField('parts', e.target.value)} /></div>
                  </div>
                  <div className="field" style={{ maxWidth: 160 }}><label>Scrap rate (%)</label><input type="number" min="0" step="0.1" value={inp.scrap} onChange={e => setField('scrap', e.target.value)} /></div>
                  <div className="sec-title" style={{ marginTop: 8 }}>Scope 3 — supplier materials <span className="tag s3">supply chain</span></div>
                  <div className="sec-sub">Add the materials you buy in; we apply each factor.</div>
                  {suppliers.map((s, i) => (
                    <div className="supplier-row" key={i}>
                      <input value={s.name} onChange={e => setSuppliers(a => a.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                      <input value={s.mat} onChange={e => setSuppliers(a => a.map((x, j) => j === i ? { ...x, mat: e.target.value } : x))} />
                      <input type="number" min="0" className="mono" value={s.t} onChange={e => setSuppliers(a => a.map((x, j) => j === i ? { ...x, t: e.target.value } : x))} />
                      <button className="x-btn" onClick={() => setSuppliers(a => a.filter((_, j) => j !== i))}>×</button>
                    </div>
                  ))}
                  <button className="btn ghost sm" onClick={() => setSuppliers(a => [...a, { name: 'New supplier', mat: 'Material', t: 0, f: 1.46 }])}>＋ Add supplier material</button>
                </div>
                <div>
                  <Banner />
                  <div className="card" style={{ marginTop: 16 }}><div className="sec-title">Quick breakdown</div><div className="sec-sub">Updates as you type</div><Breakdown /></div>
                </div>
              </div>
              <div className="ws-nav"><span /><button className="btn" onClick={() => setStep(2)}>Next: Calculate →</button></div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="step-h"><h3>Step 2 · Calculate</h3><p>Your inputs converted to CO₂ via the GHG Protocol — the universal measurement method.</p></div>
              <Banner />
              <div className="grid g2" style={{ marginTop: 16 }}>
                <div className="card"><div className="sec-title">Breakdown by scope</div><div className="sec-sub">Emissions = activity data × factor</div><Breakdown /></div>
                <div className="card"><div className="sec-title">Scope split</div><div className="sec-sub">1 direct · 2 electricity · 3 supply chain</div>
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart><Pie data={scopeData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">{scopeData.map((s, i) => <Cell key={i} fill={s.c} />)}</Pie><Legend wrapperStyle={{ fontSize: 12 }} /><Tooltip /></PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="ws-nav"><button className="btn ghost" onClick={() => setStep(1)}>← Back</button><button className="btn" onClick={() => setStep(3)}>Next: Explain →</button></div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="step-h"><h3>Step 3 · Explain &amp; Decide <span className="tag coach" style={{ verticalAlign: 'middle' }}>the differentiator</span></h3><p>Where you stand, what's driving it, the one thing to fix first — and a simulator to test the fix before you spend.</p></div>
              <div className="card" style={{ marginBottom: 16 }}>
                <div className="sec-title">Where you stand <span className="tag s2">Layer 1 · comparison</span></div>
                <div className="sec-sub">Your intensity vs published benchmark for metal stamping</div>
                <div className="thermo"><div className="bench" style={{ left: '62%' }}>Benchmark 2.1</div><div className="mark" style={{ left: '62%' }} /><div className="mark" style={{ left: '74%', background: 'var(--red)' }} /><div className="bench" style={{ left: '74%', color: 'var(--red)' }}>You {c.perPart.toFixed(1)}</div></div>
                <div className="thermo-scale"><span>1.5 best-in-class</span><span>2.1 benchmark</span><span>3.0 laggard</span></div>
                <div className="note" style={{ marginTop: 18 }}>You are <b>{Math.round((c.perPart / 2.1 - 1) * 100)}% above the benchmark</b> of 2.1 kg CO₂/part. Under CBAM this gap means a higher per-tonne charge on EU shipments.</div>
              </div>
              <div className="grid g2" style={{ marginBottom: 16 }}>
                <div className="card"><div className="sec-title">What's driving it</div><div className="sec-sub">Biggest contributors, ranked</div>
                  {c.drivers.map((x, i) => { const max = c.drivers[0][1] || 1; return (
                    <div className="driver" key={i}><div className="dh"><span>{x[0]}</span><span>{x[1].toFixed(1)} t · {c.tot ? Math.round(x[1] / c.tot * 100) : 0}%</span></div><div className="bar"><div className="fill" style={{ width: (c.tot ? x[1] / max * 100 : 0) + '%', background: x[2] }} /></div></div>
                  ) })}
                </div>
                <div className="card"><div className="sec-title">What to fix first <span className="tag coach">Layer 2 · rule engine</span></div><div className="sec-sub">Explainable IF–THEN rules · no invented numbers</div>
                  <div className="rec"><div className="num">1</div><div style={{ flex: 1 }}><h4>Shift peak-hour electricity load</h4><p>Rule: electricity share &gt; 60%. Move press runs off the 2–6pm peak window; add partial solar.</p><div className="save">~RM 42,000/yr · ~11 tCO₂e</div></div></div>
                  <div className="rec" style={{ marginTop: 12 }}><div className="num p2">2</div><div style={{ flex: 1 }}><h4>Cut scrap rate (9.5% → 6%)</h4><p>Rule: scrap rate &gt; 8%. Material yield is a hotspot.</p><div className="save">~RM 21,000/yr · ~6 tCO₂e</div></div></div>
                  <div className="note">⚠️ ~20% of edge cases are flagged for expert review — honest, no fake advice.</div>
                </div>
              </div>
              <div className="card">
                <div className="sec-title">What-if simulator <span className="tag coach">decision support</span></div>
                <div className="sec-sub">Drag the levers — see the new footprint and ringgit saved before committing budget.</div>
                <div className="grid g2" style={{ gap: 24 }}>
                  <div>
                    <div className="sim-row"><div className="sl-head"><span>Shift load off peak (2–6pm)</span><span>{sim.shift}%</span></div><input type="range" min="0" max="100" value={sim.shift} onChange={e => setSim(s => ({ ...s, shift: +e.target.value }))} /></div>
                    <div className="sim-row"><div className="sl-head"><span>Add rooftop solar (% of electricity)</span><span>{sim.solar}%</span></div><input type="range" min="0" max="40" value={sim.solar} onChange={e => setSim(s => ({ ...s, solar: +e.target.value }))} /></div>
                    <div className="sim-row"><div className="sl-head"><span>Reduce scrap rate to</span><span>{(+sim.scrapTgt).toFixed(1)}%</span></div><input type="range" min="4" max="9.5" step="0.1" value={sim.scrapTgt} onChange={e => setSim(s => ({ ...s, scrapTgt: +e.target.value }))} /></div>
                  </div>
                  <div>
                    <div className="sim-out">
                      <div className="sim-stat"><div className="l">New footprint</div><div className="v">{sm.projTot.toFixed(1)} t</div></div>
                      <div className="sim-stat"><div className="l">Per part</div><div className="v">{sm.projPerPart.toFixed(2)}</div></div>
                      <div className="sim-stat"><div className="l">CO₂ saved/yr</div><div className="v good">{sm.co2Saved.toFixed(0)} t</div></div>
                      <div className="sim-stat" style={{ gridColumn: 'span 3' }}><div className="l">Estimated cost saving / year</div><div className="v good" style={{ fontSize: 26 }}>RM {Math.round(sm.rm).toLocaleString()}</div></div>
                    </div>
                    <div className="note" style={{ marginTop: 12 }}>Rule-based estimates — a planning aid, not a guarantee.</div>
                  </div>
                </div>
              </div>
              <div className="ws-nav"><button className="btn ghost" onClick={() => setStep(2)}>← Back</button><button className="btn" onClick={() => setStep(4)}>Next: Detect →</button></div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="step-h"><h3>Step 4 · Detect <span className="tag warn" style={{ verticalAlign: 'middle' }}>Phase 2 · data-dependent</span></h3><p>Flags abnormal patterns — a machine drawing more than its own baseline, or peak-hour spikes.</p></div>
              <div className="note amber">⚠ Anomaly &amp; peak-hour detection need granular per-machine / time-stamped data. On monthly bill data this stays locked. The demo runs on the UCI Steel Industry dataset (15-min granularity) — connect a smart meter to enable it on your data.</div>
              <div className="grid g2">
                <div className="card"><div className="sec-title">Energy load — 24h profile <span className="tag s2">UCI demo data</span></div><div className="sec-sub">Peak-hour window detected · red = abnormal draw</div>
                  <ResponsiveContainer width="100%" height={210}>
                    <LineChart data={DETECT.map((v, i) => ({ h: i + ':00', load: v, an: (i >= 14 && i <= 16) ? v : null }))} margin={{ top: 6, right: 10, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="rgba(148,148,148,.15)" vertical={false} />
                      <XAxis dataKey="h" tick={{ fill: '#9bb0a4', fontSize: 9 }} interval={3} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9bb0a4', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="load" name="Load (kW)" stroke="#a3e635" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="an" name="Anomaly" stroke="#fb7185" strokeWidth={2.5} dot={{ r: 3, fill: '#fb7185' }} connectNulls={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="card"><div className="sec-title">Flagged anomalies</div><div className="sec-sub">Above each machine's own baseline</div>
                  <div className="rec"><div className="num" style={{ background: 'var(--red)', color: '#0a1a10' }}>!</div><div style={{ flex: 1 }}><h4>Press #3 — 14:00–16:00</h4><p>Drawing <b>+28%</b> above its 30-day baseline during peak tariff.</p></div></div>
                  <div className="rec" style={{ marginTop: 12 }}><div className="num p2">!</div><div style={{ flex: 1 }}><h4>Compressor — weekend baseline</h4><p>41% of weekday load on Sundays with no production.</p></div></div>
                </div>
              </div>
              <div className="ws-nav"><button className="btn ghost" onClick={() => setStep(3)}>← Back</button><button className="btn" onClick={() => setStep(5)}>Next: Report →</button></div>
            </div>
          )}

          {step === 5 && (
            <div>
              <div className="step-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                <div><h3>Step 5 · Report</h3><p>Same data → the format your buyer or regulator wants. Export to PDF or Word.</p></div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="toggle"><button className={repType === 'ifrs' ? 'active' : ''} onClick={() => setRepType('ifrs')}>IFRS S2</button><button className={repType === 'cbam' ? 'active' : ''} onClick={() => setRepType('cbam')}>CBAM</button></div>
                  <button className="btn ghost sm" onClick={() => exportPDF(repType, narr)}>⬇ PDF</button>
                  <button className="btn sm" onClick={() => exportWord(repType, narr)}>⬇ Word</button>
                </div>
              </div>
              {repType === 'ifrs' ? (
                <div className="report-paper">
                  <div className="rh"><div><h3 className="docttl">IFRS S2 Climate Disclosure</h3><small>Creative Bliss Sdn Bhd · FY2026 · Company-level</small></div><div style={{ textAlign: 'right' }}><span className="badge-ok">Audit-ready draft</span></div></div>
                  <div className="rdoc">
                    <h4>Greenhouse gas emissions (GHG Protocol)</h4>
                    <table className="rtable"><thead><tr><th>Scope</th><th>Description</th><th style={{ textAlign: 'right' }}>tCO₂e</th></tr></thead><tbody>
                      <tr><td><span className="tag s1">Scope 1</span></td><td>Direct — diesel &amp; gas on-site</td><td className="n">11.6</td></tr>
                      <tr><td><span className="tag s2">Scope 2</span></td><td>Purchased electricity</td><td className="n">88.8</td></tr>
                      <tr><td><span className="tag s3">Scope 3</span></td><td>Purchased materials</td><td className="n">124.1</td></tr>
                    </tbody><tfoot><tr><td colSpan="2" style={{ fontWeight: 700, color: 'var(--ink)' }}>Total</td><td className="n">224.5</td></tr></tfoot></table>
                    <h4>Qualitative disclosures <span className="tag coach" style={{ textTransform: 'none', letterSpacing: 0 }}>you author · we structure</span></h4>
                    <div className="field"><label>Governance</label><textarea value={narr.gov} onChange={e => setNarr(n => ({ ...n, gov: e.target.value }))} /></div>
                    <div className="field"><label>Strategy &amp; climate risks</label><textarea value={narr.strat} onChange={e => setNarr(n => ({ ...n, strat: e.target.value }))} /></div>
                    <div className="field"><label>Transition plan</label><textarea value={narr.plan} onChange={e => setNarr(n => ({ ...n, plan: e.target.value }))} /></div>
                    <div className="note">✓ Roll-up across sites · ✓ Scope 1/2/3 split · ⚠ Narrative authored by company</div>
                  </div>
                </div>
              ) : (
                <div className="report-paper">
                  <div className="rh"><div><h3 className="docttl">CBAM Embedded Emissions Report</h3><small>Creative Bliss Sdn Bhd · Batch SB-4471 · Product-level</small></div><div style={{ textAlign: 'right' }}><span className="tag s1">Verification pending</span></div></div>
                  <div className="rdoc">
                    <h4>Embedded emissions</h4>
                    <table className="rtable"><thead><tr><th>Component</th><th>Definition</th><th style={{ textAlign: 'right' }}>tCO₂e/t</th></tr></thead><tbody>
                      <tr><td>Direct</td><td>On-site fuel (Scope 1 eq.)</td><td className="n">0.18</td></tr>
                      <tr><td>Indirect</td><td>Purchased electricity (Scope 2 eq.)</td><td className="n">0.76</td></tr>
                      <tr><td>Precursor</td><td>Cradle-to-gate steel</td><td className="n">1.46</td></tr>
                    </tbody><tfoot><tr><td colSpan="2" style={{ fontWeight: 700, color: 'var(--ink)' }}>Total specific embedded emissions</td><td className="n">2.40</td></tr></tfoot></table>
                    <div className="note">Reporting your actual emissions instead of the EU default (3.15, +31%) avoids the penalty markup — est. RM 50,000–200,000/yr saving.</div>
                  </div>
                </div>
              )}
              <div className="ws-nav"><button className="btn ghost" onClick={() => setStep(4)}>← Back</button><button className="btn ghost" onClick={onClose}>Done · close</button></div>
            </div>
          )}
        </div>
      </div>

      {wizard && (
        <Modal title={'Connect ' + wizard.name} onClose={() => setWizard(null)} actions={wizardActions()}>
          {wizardBody()}
        </Modal>
      )}
    </div>
  )
}
