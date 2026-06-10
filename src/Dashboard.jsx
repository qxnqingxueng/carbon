import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const trend = [
  { m: 'Oct', a: 26 }, { m: 'Nov', a: 27 }, { m: 'Dec', a: 28 }, { m: 'Jan', a: 26.5 },
  { m: 'Feb', a: 25 }, { m: 'Mar', a: 25.6 }, { m: 'Apr', a: 24.3 }, { m: 'May', a: 23.6 },
  { m: 'Jun', a: 22.4, f: 22.4 }, { m: 'Jul', f: 21.3 }, { m: 'Aug', f: 20.4 }, { m: 'Sep', f: 19.6 },
]
const scope = [
  { name: 'Scope 1', value: 11.6, c: '#f59e0b' },
  { name: 'Scope 2', value: 88.8, c: '#a3e635' },
  { name: 'Scope 3', value: 124.1, c: '#b794f6' },
]
const KPI = [
  { ic: '🌍', bg: 'rgba(163,230,53,.12)', col: 'var(--lime)', lab: 'Total emissions', val: '224.5', unit: ' tCO₂e', d: '▼ 6.2% vs last quarter', dc: 'down' },
  { ic: '▣', bg: 'rgba(245,158,11,.12)', col: 'var(--ember)', lab: 'Per product', val: '2.40', unit: ' kg/part', d: '▲ 14% above benchmark', dc: 'up' },
  { ic: '⚡', bg: 'rgba(86,182,230,.16)', col: 'var(--blue)', lab: 'Grid factor', val: '0.74', unit: ' kg/kWh', d: 'Peninsular MY', dc: 'neu' },
  { ic: '◎', bg: 'rgba(163,230,53,.12)', col: 'var(--lime)', lab: 'Savings found', val: 'RM 71k', unit: '/yr', d: '3 actions', dc: 'down', valCol: 'var(--lime)' },
]

export default function Dashboard({ go, onOpen, rows = [] }) {
  return (
    <div className="content">
      <div className="page-head">
        <div>
          <div className="eyebrow">✦ Welcome back</div>
          <h2>Hi, <span>Katherine</span></h2>
          <p>A snapshot of your factory's carbon footprint, and what it's worth to fix it.</p>
        </div>
        <button className="btn" onClick={onOpen}>＋ New assessment</button>
      </div>

      <div className="hero-roi">
        <div className="lab">Why this matters · estimated annual value</div>
        <div className="big">~<span>50×</span> return on a RM 12k/yr tool</div>
        <div className="roi-lines">
          <div className="roi-line">Avoided CBAM penalty<b>RM 50k–200k</b></div>
          <div className="roi-line">Protected MNC contract<b>RM 500k+</b></div>
          <div className="roi-line">Saved ESG staff time<b>RM 24k</b></div>
          <div className="roi-line">Engineering savings<b>RM 30k–80k</b></div>
        </div>
      </div>

      <div className="snapshot-row" style={{ marginTop: 24 }}>
        <div className="lbl">Snapshot · <b>This month</b></div>
        <div className="period">🗓 June 2026 ▾</div>
      </div>

      <div className="grid g4" style={{ marginBottom: 16 }}>
        {KPI.map((k, i) => (
          <div className="card kpi" key={i}>
            <div className="glow" />
            <div className="ic-box" style={{ background: k.bg, color: k.col }}>{k.ic}</div>
            <div className="lab">{k.lab}</div>
            <div className="val" style={k.valCol ? { color: k.valCol } : undefined}>{k.val}<small>{k.unit}</small></div>
            <div className={'delta ' + k.dc}>{k.d}</div>
          </div>
        ))}
      </div>

      <div className="grid g2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="sec-title">Emissions trend &amp; forecast</div>
          <div className="sec-sub">Monthly Scope 1 + 2, tCO₂e · dashed = projection</div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={trend} margin={{ top: 6, right: 10, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148,148,148,.15)" vertical={false} />
              <XAxis dataKey="m" tick={{ fill: '#9bb0a4', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9bb0a4', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0b1611', border: '1px solid #27392e', borderRadius: 10, color: '#eef3ee', fontSize: 12 }} />
              <Line type="monotone" dataKey="a" name="Actual" stroke="#a3e635" strokeWidth={2.5} dot={{ r: 3, fill: '#a3e635' }} connectNulls />
              <Line type="monotone" dataKey="f" name="Forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="sec-title">By scope</div>
          <div className="sec-sub">GHG Protocol breakdown</div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={scope} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
                {scope.map((s, i) => <Cell key={i} fill={s.c} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12, color: '#9bb0a4' }} />
              <Tooltip contentStyle={{ background: '#0b1611', border: '1px solid #27392e', borderRadius: 10, color: '#eef3ee', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid g2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sec-title">Recent assessments</div>
            <button className="link" onClick={() => go('assess')}>View all ↗</button>
          </div>
          <div className="sec-sub">Each run flows Input → Calculate → Explain → Detect → Report</div>
          <table className="ltable">
            <thead><tr><th>Period</th><th>Total</th><th>Per part</th><th>Status</th></tr></thead>
            <tbody>
              {rows.length ? rows.slice(0, 5).map(r => (
                <tr key={r.id} onClick={onOpen}><td><b>{r.period || 'Assessment'}</b></td><td className="n">{r.result.total} t</td><td className="n">{r.result.perPart}</td><td>{r.result.perPart > 2.1 ? <span className="tag s1">Above benchmark</span> : <span className="badge-ok">On track</span>}</td></tr>
              )) : (<>
                <tr onClick={onOpen}><td><b>June 2026</b></td><td className="n">224.5 t</td><td className="n">2.40</td><td><span className="tag s1">Above benchmark</span></td></tr>
                <tr onClick={onOpen}><td><b>May 2026</b></td><td className="n">231.0 t</td><td className="n">2.56</td><td><span className="tag s1">Above benchmark</span></td></tr>
                <tr onClick={onOpen}><td><b>Q1 2026</b></td><td className="n">688.0 t</td><td className="n">2.61</td><td><span className="badge-ok">Reported</span></td></tr>
              </>)}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="sec-title">Compliance status</div>
          <div className="sec-sub">Standards relevant to you</div>
          <div className="compliance-row"><div><b>IFRS S2</b><div className="csub">Bursa · due 2026</div></div><span className="badge-ok">Ready</span></div>
          <div className="compliance-row"><div><b>EU CBAM</b><div className="csub">Product-level · 2026</div></div><span className="tag s1">Needs CN code</span></div>
          <div className="compliance-row"><div><b>GHG Protocol</b><div className="csub">Calculation method</div></div><span className="badge-ok">Verified</span></div>
        </div>
      </div>

      <div className="card">
        <div className="sec-title">Top recommendation <span className="tag coach">Coach</span></div>
        <div className="sec-sub">The single highest-impact fix this quarter — the "so what, now what" layer</div>
        <div className="rec">
          <div className="num">1</div>
          <div style={{ flex: 1 }}>
            <h4>Shift peak-hour electricity load</h4>
            <p>Electricity is <b style={{ color: 'var(--ink)' }}>63% of your footprint</b>. Moving press operations off the 2–6pm peak tariff window and adding partial solar cuts both emissions and the highest-cost kWh blocks.</p>
            <div className="save">Estimated saving: ~RM 42,000/yr · ~11 tCO₂e</div>
          </div>
        </div>
      </div>
    </div>
  )
}
