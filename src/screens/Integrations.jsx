import { useState } from 'react'
import { toast } from '../util.js'
import Modal from '../Modal.jsx'

const EXT = {
  'SQL Account': 'https://www.sql.com.my/', 'AutoCount': 'https://www.autocountsoft.com/',
  'QuickBooks': 'https://quickbooks.intuit.com/', 'Xero': 'https://www.xero.com/',
  'TNB myTNB': 'https://www.mytnb.com.my/', 'Smart meter': 'https://www.st.gov.my/',
}
const ACC = [['SQL Account', '🧾'], ['AutoCount', '📒'], ['QuickBooks', '💼'], ['Xero', '🟦']]
const UTIL = [['TNB myTNB', '⚡', 'Electricity bills'], ['Smart meter', '📈', 'Unlocks Detect']]

export default function Integrations() {
  const [connected, setConnected] = useState({})
  const [wiz, setWiz] = useState(null) // name
  const tile = (name, cl, sub) => (
    <div key={name} className={'conn' + (connected[name] ? ' connected' : '')} onClick={() => setWiz(name)}>
      <div className="cl">{cl}</div><div className="cn">{name}</div><div className="cs">{connected[name] ? 'Connected ✓' : (sub || 'Connect')}</div>
    </div>
  )
  return (
    <div className="content">
      <div className="page-head"><div><div className="eyebrow">✦ Data &amp; trust</div><h2><span>Integrations</span></h2><p>Pull the numbers from where they already live. Connect once; emissions update automatically.</p></div></div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="sec-title">Accounting &amp; ERP <span className="tag coach">auto spend → emissions</span></div>
        <div className="sec-sub">Popular with Malaysian SMEs. Connecting maps invoices and utility spend to activity data.</div>
        <div className="conn-grid">{ACC.map(([n, c]) => tile(n, c))}</div>
      </div>
      <div className="grid g2">
        <div className="card"><div className="sec-title">Utility &amp; meters</div><div className="sec-sub">For automatic Scope 1 &amp; 2</div>
          <div className="conn-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>{UTIL.map(([n, c, s]) => tile(n, c, s))}</div></div>
        <div className="card"><div className="sec-title">Why connect?</div><div className="sec-sub">vs manual entry</div>
          <p style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.6 }}>Connecting your accounting system turns months of invoices into emissions in one click — the lowest-friction path for a busy factory. Smart-meter data additionally unlocks the anomaly &amp; peak-hour detection in Step 4.</p>
          <div className="note">Demo note: connectors are illustrative here. In production these are real OAuth integrations on the backend.</div></div>
      </div>
      {wiz && (
        <Modal title={'Connect ' + wiz} onClose={() => setWiz(null)} actions={[
          { label: 'Cancel', kind: 'ghost', onClick: () => setWiz(null) },
          { label: 'Authorize at ' + wiz + ' ↗', onClick: () => { window.open(EXT[wiz], '_blank', 'noopener'); setConnected(c => ({ ...c, [wiz]: true })); toast(wiz + ' connected', '✓'); setWiz(null) } },
        ]}>
          <div className="wz"><div className="wz-logo">🔗</div><p>You'll be redirected to <b>{wiz}</b> to sign in and grant read-only access to your billing &amp; invoice data.</p><p className="wz-note">Demo — opens {wiz} in a new tab; no real account is linked.</p></div>
        </Modal>
      )}
    </div>
  )
}
