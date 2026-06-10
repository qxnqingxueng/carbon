import { useState, useEffect } from 'react'
import Dashboard from './Dashboard.jsx'
import Assessment from './Assessment.jsx'
import Regulations from './screens/Regulations.jsx'
import Reports from './screens/Reports.jsx'
import Factors from './screens/Factors.jsx'
import Facilities from './screens/Facilities.jsx'
import Suppliers from './screens/Suppliers.jsx'
import Integrations from './screens/Integrations.jsx'
import Audit from './screens/Audit.jsx'
import Settings from './screens/Settings.jsx'
import { api } from './api.js'

const NAV = [
  { group: 'Compliance' },
  { id: 'dash', ic: '◷', label: 'Dashboard' },
  { id: 'assess', ic: '▤', label: 'Assessments' },
  { id: 'reports', ic: '▦', label: 'Reports' },
  { id: 'regs', ic: '⏱', label: 'Regulations' },
  { group: 'Supply chain' },
  { id: 'suppliers', ic: '⇄', label: 'Suppliers (Scope 3)' },
  { group: 'Data & trust' },
  { id: 'integrations', ic: '⊞', label: 'Integrations' },
  { id: 'factors', ic: '≡', label: 'Benchmarks & Factors' },
  { id: 'facilities', ic: '⌂', label: 'Facilities' },
  { id: 'audit', ic: '✓', label: 'Audit & Verification' },
  { group: 'Account', perk: 'PLAN: PRO' },
  { id: 'settings', ic: '⚙', label: 'Settings & Billing' },
  { id: 'help', ic: '?', label: 'Help & Docs' },
]

const TITLES = { dash: 'Dashboard', assess: 'Assessments', reports: 'Reports', regs: 'Regulations', suppliers: 'Suppliers', integrations: 'Integrations', factors: 'Benchmarks & Factors', facilities: 'Facilities', audit: 'Audit & Verification', settings: 'Settings & Billing', help: 'Help & Docs' }

export default function Shell({ onLogout }) {
  const [view, setView] = useState('dash')
  const [collapsed, setCollapsed] = useState(false)
  const [light, setLight] = useState(false)
  const [menu, setMenu] = useState(null) // 'notif' | 'avatar' | null
  const [assessment, setAssessment] = useState(false)
  const [rows, setRows] = useState([])
  const loadRows = () => api.listAssessments().then(setRows).catch(() => {})

  useEffect(() => { document.body.classList.toggle('collapsed', collapsed) }, [collapsed])
  useEffect(() => { document.body.classList.toggle('light', light) }, [light])
  useEffect(() => {
    const close = () => setMenu(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])
  useEffect(() => { loadRows() }, [])

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo" />
          <div className="bt"><h1>Carbon</h1><small>CARBONDESK · EARLY ACCESS</small></div>
        </div>
        {NAV.map((n, i) =>
          n.group ? (
            <div className="nav-label" key={'g' + i}><span>{n.group}</span>{n.perk && <span className="perk">{n.perk}</span>}</div>
          ) : (
            <button key={n.id} className={'nav-item' + (view === n.id ? ' active' : '')} onClick={() => setView(n.id)}>
              <span className="ic">{n.ic}</span><span className="txt">{n.label}</span>
            </button>
          )
        )}
        <div className="side-foot">Creative Bliss Sdn Bhd · Penang</div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="left">
            <button className="icon-btn" onClick={() => setCollapsed(c => !c)}>≡</button>
            <span className="ea-pill">EXCLUSIVE EARLY ACCESS</span>
          </div>
          <div className="top-right">
            <button className="icon-btn" onClick={() => setLight(l => !l)}>{light ? '☀' : '☾'}</button>
            <div className="dd" onClick={(e) => e.stopPropagation()}>
              <button className="icon-btn" onClick={() => setMenu(menu === 'notif' ? null : 'notif')}>◔<span className="dot-badge" /></button>
              {menu === 'notif' && (
                <div className="menu" style={{ minWidth: 288 }}>
                  <div className="mhead"><b>Notifications</b><span>3 new</span></div>
                  <div className="mi notif"><b>IFRS S2 deadline approaching</b><span>Main Market disclosure due 2026</span></div>
                  <div className="mi notif"><b>Supplier data received</b><span>MetalSource returned figures</span></div>
                  <div className="mi notif"><b>CBAM needs a CN code</b><span>Batch SB-4471 pending</span></div>
                </div>
              )}
            </div>
            <span>ops@creativebliss.my</span>
            <div className="dd" onClick={(e) => e.stopPropagation()}>
              <div className="avatar" onClick={() => setMenu(menu === 'avatar' ? null : 'avatar')}>CB</div>
              {menu === 'avatar' && (
                <div className="menu">
                  <div className="mhead"><b>Creative Bliss Sdn Bhd</b><span>ops@creativebliss.my · Pro plan</span></div>
                  <div className="mi" onClick={() => { setView('settings'); setMenu(null) }}><span>⚙</span> Settings &amp; Billing</div>
                  <div className="mi" style={{ color: 'var(--red)' }} onClick={onLogout}><span>↩</span> Log out</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {assessment ? <Assessment onClose={() => setAssessment(false)} onSaved={loadRows} />
          : view === 'dash' ? <Dashboard go={setView} onOpen={() => setAssessment(true)} rows={rows} />
          : view === 'reports' ? <Reports onOpen={() => setAssessment(true)} />
          : view === 'regs' ? <Regulations />
          : view === 'suppliers' ? <Suppliers />
          : view === 'integrations' ? <Integrations />
          : view === 'factors' ? <Factors />
          : view === 'facilities' ? <Facilities onOpen={() => setAssessment(true)} />
          : view === 'audit' ? <Audit />
          : view === 'settings' ? <Settings />
          : view === 'assess' ? (
            <div className="content">
              <div className="page-head"><div><div className="eyebrow">✦ Compliance</div><h2><span>Assessments</span></h2><p>Every carbon run you've created. Open one to step through the flow.</p></div><button className="btn" onClick={() => setAssessment(true)}>＋ New assessment</button></div>
              <div className="card" style={{ padding: 8 }}><table className="ltable"><thead><tr><th>Period</th><th>Facility</th><th>Total</th><th>Per part</th><th>Status</th></tr></thead><tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan="5" style={{ color: 'var(--mute)' }}>No assessments saved yet — open a new assessment and click <b>Save</b>.</td></tr>
                ) : rows.map(r => (
                  <tr key={r.id} onClick={() => setAssessment(true)}><td><b>{r.period || 'Assessment'}</b></td><td>Penang · Line A</td><td className="n">{r.result.total} t</td><td className="n">{r.result.perPart}</td><td>{r.result.perPart > 2.1 ? <span className="tag s1">Above benchmark</span> : <span className="badge-ok">On track</span>}</td></tr>
                ))}
              </tbody></table></div>
            </div>
          )
          : view === 'help' ? (
            <div className="content">
              <div className="page-head"><div><div className="eyebrow">✦ Account</div><h2>Help &amp; <span>Docs</span></h2><p>How Carbon works, in plain language.</p></div></div>
              <div className="grid g3">
                <div className="card"><div className="sec-title">🧮 GHG Protocol</div><p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.6, marginTop: 8 }}>The universal measurement method — the "weighing scale." Emissions = activity × factor.</p></div>
                <div className="card"><div className="sec-title">🏢 IFRS S2</div><p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.6, marginTop: 8 }}>Company-level disclosure for investors and Bursa. Mandatory for Main Market by 2026.</p></div>
                <div className="card"><div className="sec-title">🏷 CBAM</div><p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.6, marginTop: 8 }}>Product-level EU border charge. Reporting actuals beats the default penalty.</p></div>
              </div>
            </div>
          )
          : (
          <div className="content"><div className="placeholder"><div><div className="pi">🧩</div><h3>{TITLES[view]}</h3><p>Coming soon.</p></div></div></div>
        )}
      </div>
    </div>
  )
}
