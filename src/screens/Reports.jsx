import { useState, useEffect } from 'react'
import { api } from '../api.js'

export default function Reports({ onOpen }) {
  const [rows, setRows] = useState([])
  useEffect(() => { api.listAssessments().then(setRows).catch(() => {}) }, [])

  return (
    <div className="content">
      <div className="page-head"><div><div className="eyebrow">✦ Compliance</div><h2>Generated <span>Reports</span></h2><p>Every saved assessment can be exported as an IFRS S2 or CBAM report. Loaded from your account.</p></div></div>
      <div className="card" style={{ padding: 8 }}>
        <table className="ltable">
          <thead><tr><th>Document</th><th>Standard</th><th>Scope</th><th>Generated</th><th>Status</th></tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan="5" style={{ color: 'var(--mute)' }}>No reports yet — open a <b>New assessment</b>, click <b>Save</b>, then open it to generate a report.</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} onClick={onOpen}>
                <td><b>{(r.period || 'Assessment')} Climate Disclosure</b></td>
                <td><span className="tag s2">IFRS S2</span></td>
                <td>Company-level</td>
                <td>{(r.created_at || '').slice(0, 10)}</td>
                <td><span className="badge-ok">Audit-ready draft</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note" style={{ maxWidth: 720 }}>💡 IFRS S2 and CBAM run on the <b>same GHG Protocol numbers</b> — re-aggregated company-level vs product-level. Open any row to preview and export as PDF or Word.</div>
    </div>
  )
}
