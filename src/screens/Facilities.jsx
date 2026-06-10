import { useState, useEffect } from 'react'
import { toast } from '../util.js'
import { api } from '../api.js'
import Modal from '../Modal.jsx'

export default function Facilities({ onOpen }) {
  const [rows, setRows] = useState([])
  const load = () => api.listFacilities().then(setRows).catch(() => {})
  useEffect(() => { load() }, [])

  const [modal, setModal] = useState(false)
  const [draft, setDraft] = useState({ name: '', loc: 'Penang', act: '', s12: 50, s3: 40 })
  const add = async () => {
    try {
      await api.addFacility({ ...draft, s12: +draft.s12 || 0, s3: +draft.s3 || 0, name: draft.name || 'New facility' })
      setModal(false); setDraft({ name: '', loc: 'Penang', act: '', s12: 50, s3: 40 }); load(); toast('Facility added to company roll-up', '✓')
    } catch (e) { toast('Add failed: ' + e.message, '⚠') }
  }
  const remove = async (id) => { try { await api.deleteFacility(id); load(); toast('Facility removed') } catch (e) { toast('Delete failed', '⚠') } }

  const tot = rows.reduce((a, f) => a + f.s12 + f.s3, 0)
  const s3 = rows.reduce((a, f) => a + f.s3, 0)
  const s12 = rows.reduce((a, f) => a + f.s12, 0)
  const KPIS = [['Company total', tot.toFixed(1) + ' t', rows.length + ' sites'], ['Scope 1+2', s12.toFixed(1) + ' t', ''], ['Scope 3', s3.toFixed(1) + ' t', ''], ['Sites', rows.length, '']]

  return (
    <div className="content">
      <div className="page-head"><div><div className="eyebrow">✦ Data &amp; trust</div><h2><span>Facilities</span> &amp; roll-up</h2><p>Per-site emissions aggregate into one company total — the IFRS S2 multi-site disclosure. Saved to your account.</p></div><button className="btn" onClick={() => setModal(true)}>＋ Add facility</button></div>
      <div className="grid g4" style={{ marginBottom: 16 }}>
        {KPIS.map((k, i) => <div className="card kpi" key={i}><div className="lab">{k[0]}</div><div className="val">{k[1]}</div>{k[2] && <div className="delta neu">{k[2]}</div>}</div>)}
      </div>
      <div className="card" style={{ padding: 8 }}>
        <table className="ltable">
          <thead><tr><th>Facility</th><th>Location</th><th>Activity</th><th>Scope 1+2</th><th>Scope 3</th><th>Total</th><th></th></tr></thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan="7" style={{ color: 'var(--mute)' }}>No facilities yet — add one.</td></tr> : rows.map(f => (
              <tr key={f.id}><td><b>{f.name}</b></td><td>{f.loc}</td><td>{f.act}</td><td className="n">{f.s12.toFixed(1)} t</td><td className="n">{f.s3.toFixed(1)} t</td><td className="n">{(f.s12 + f.s3).toFixed(1)} t</td>
                <td style={{ textAlign: 'right' }}><button className="x-btn" onClick={() => remove(f.id)}>×</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="note">IFRS S2 is company-level: these site totals roll up into the single figure investors and Bursa see. CBAM stays product-level — same numbers, re-aggregated.</div>
      {modal && (
        <Modal title="Add facility" onClose={() => setModal(false)} actions={[{ label: 'Cancel', kind: 'ghost', onClick: () => setModal(false) }, { label: 'Add facility', onClick: add }]}>
          <div className="wz">
            <div className="field"><label>Facility name</label><input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Line C" /></div>
            <div className="row2"><div className="field"><label>Location</label><input value={draft.loc} onChange={e => setDraft(d => ({ ...d, loc: e.target.value }))} /></div><div className="field"><label>Activity</label><input value={draft.act} onChange={e => setDraft(d => ({ ...d, act: e.target.value }))} placeholder="e.g. Welding" /></div></div>
            <div className="row2"><div className="field"><label>Scope 1+2 (tCO₂e)</label><input type="number" value={draft.s12} onChange={e => setDraft(d => ({ ...d, s12: e.target.value }))} /></div><div className="field"><label>Scope 3 (tCO₂e)</label><input type="number" value={draft.s3} onChange={e => setDraft(d => ({ ...d, s3: e.target.value }))} /></div></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
