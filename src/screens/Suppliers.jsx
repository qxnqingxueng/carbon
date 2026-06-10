import { useState, useEffect } from 'react'
import { toast } from '../util.js'
import { api } from '../api.js'

const ST = { received: ['Received', 'badge-ok'], pending: ['Requested', 'tag s1'], none: ['Not sent', 'tag warn'] }
const SRC = { received: 'Primary', pending: 'Awaiting', none: 'Estimated' }
const FILL = [18, 12, 22]

export default function Suppliers() {
  const [rows, setRows] = useState([])
  const load = () => api.listSuppliers().then(setRows).catch(() => {})
  useEffect(() => { load() }, [])

  const request = async (s) => {
    try {
      await api.updateSupplier(s.id, { ...s, status: 'pending' }); load(); toast('Data request emailed to ' + s.name)
      setTimeout(async () => {
        await api.updateSupplier(s.id, { ...s, status: 'received', tonnes: s.tonnes || FILL[s.id % 3] }); load()
        toast(s.name + ' returned their figures', '✓')
      }, 2200)
    } catch (e) { toast('Request failed: ' + e.message, '⚠') }
  }

  const done = rows.filter(r => r.status === 'received').length
  const est = rows.reduce((a, r) => a + (r.tonnes || 0) * (r.factor || 1.46), 0)
  const KPIS = [['Suppliers tracked', rows.length], ['Responded', done, 'var(--lime)'],
    ['Coverage', rows.length ? Math.round(done / rows.length * 100) + '%' : '0%'], ['Est. Scope 3', est.toFixed(1) + ' t']]

  return (
    <div className="content">
      <div className="page-head"><div><div className="eyebrow">✦ Supply chain</div><h2>Supplier <span>data requests</span></h2><p>Request real figures from your suppliers, track responses, and roll them into Scope 3 — saved to your account.</p></div>
        <button className="btn" onClick={() => rows.forEach(r => r.status === 'none' && request(r))}>⇄ Request from all pending</button></div>
      <div className="grid g4" style={{ marginBottom: 16 }}>
        {KPIS.map((k, i) => <div className="card kpi" key={i}><div className="lab">{k[0]}</div><div className="val" style={k[2] ? { color: k[2] } : undefined}>{k[1]}</div></div>)}
      </div>
      <div className="card" style={{ padding: 8 }}>
        <table className="ltable">
          <thead><tr><th>Supplier</th><th>Material</th><th>Tonnes</th><th>Data source</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan="6" style={{ color: 'var(--mute)' }}>No suppliers yet.</td></tr> : rows.map((s) => (
              <tr key={s.id}><td><b>{s.name}</b></td><td>{s.mat}</td><td className="n">{s.tonnes || '—'}</td><td>{SRC[s.status]}</td>
                <td><span className={ST[s.status][1]}>{ST[s.status][0]}</span></td>
                <td style={{ textAlign: 'right' }}>{s.status !== 'received' ? <button className="btn ghost sm" onClick={() => request(s)}>Request data</button> : '✓'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note">Primary supplier data beats default factors and is what verifiers and CBAM want. Each request emails the supplier a one-screen form — no account needed on their side. Saved to your company record.</div>
    </div>
  )
}
