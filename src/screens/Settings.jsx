import { useState } from 'react'
import { toast } from '../util.js'
import Modal from '../Modal.jsx'

const TIERS = [
  { pl: 'Free', pr: 'RM 0', li: ['Single site', 'Scope 1 + 2 only', 'Footprint + benchmark', '1 report/yr'] },
  { pl: 'Starter', pr: 'RM 299', per: '/mo', li: ['Single-site SME', '+ the decision coach', '1 report standard'] },
  { pl: 'Pro', pr: 'RM 999', per: '/mo', li: ['Multi-site roll-up', 'Scope 1+2+3', 'IFRS S2 + CBAM', 'PDF / Word export'] },
  { pl: 'Enterprise', pr: 'RM 3,500', per: '/mo', li: ['Listed companies', 'Audit-ready, verified', 'API + anomaly (IoT)'] },
]
export default function Settings() {
  const [tab, setTab] = useState('profile')
  const [team, setTeam] = useState([{ n: 'Katherine Ng', r: 'Owner', s: 'Active' }, { n: 'Lim Wei', r: 'Editor', s: 'Active' }, { n: 'Auditor (external)', r: 'Viewer', s: 'Invited' }])
  const [plan, setPlan] = useState('Pro')
  const [invite, setInvite] = useState(null)
  const [iv, setIv] = useState({ n: '', r: 'Editor' })
  const sendInvite = () => { setTeam(t => [...t, { n: iv.n || 'New member', r: iv.r, s: 'Invited' }]); setInvite(null); setIv({ n: '', r: 'Editor' }); toast('Invitation sent', '✓') }
  return (
    <div className="content">
      <div className="page-head"><div><div className="eyebrow">✦ Account</div><h2>Settings &amp; <span>Billing</span></h2><p>Manage your profile, team and subscription.</p></div></div>
      <div className="toggle" style={{ marginBottom: 18 }}>
        {['profile', 'team', 'billing'].map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t === 'billing' ? 'Billing & Plan' : t[0].toUpperCase() + t.slice(1)}</button>)}
      </div>

      {tab === 'profile' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="sec-title">Company profile</div><div className="sec-sub">Used on report headers and the company roll-up</div>
          <div className="field"><label>Company name</label><input defaultValue="Creative Bliss Sdn Bhd" /></div>
          <div className="row2"><div className="field"><label>Industry</label><select><option>Metal stamping</option><option>Plastics</option></select></div><div className="field"><label>Primary location</label><input defaultValue="Penang, Malaysia" /></div></div>
          <button className="btn" onClick={() => toast('Profile saved', '✓')}>Save changes</button>
        </div>
      )}

      {tab === 'team' && (
        <div className="card" style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div className="sec-title">Team members</div><button className="btn ghost sm" onClick={() => setInvite(true)}>＋ Invite</button></div>
          <div className="sec-sub">Who can view and edit assessments</div>
          <table className="ltable"><tbody>{team.map((m, i) => <tr key={i}><td><b>{m.n}</b></td><td>{m.r}</td><td style={{ textAlign: 'right' }}>{m.s === 'Active' ? <span className="badge-ok">Active</span> : <span className="tag s1">Invited</span>}</td></tr>)}</tbody></table>
        </div>
      )}

      {tab === 'billing' && (
        <>
          <div className="tiers">
            {TIERS.map(t => (
              <div className={'tier' + (plan === t.pl ? ' cur' : '')} key={t.pl}>
                {plan === t.pl && <div className="badge-cur">CURRENT</div>}
                <div className="pl">{t.pl}</div><div className="pr">{t.pr}{t.per && <small>{t.per}</small>}</div>
                <ul>{t.li.map((l, i) => <li key={i}>{l}</li>)}</ul>
                {plan === t.pl ? <button className="btn full" disabled>Current plan</button> : <button className="btn block full" onClick={() => { setPlan(t.pl); toast('Switched to ' + t.pl + ' plan', '✓') }}>Choose {t.pl}</button>}
              </div>
            ))}
          </div>
          <div className="note" style={{ maxWidth: 780 }}>Free tier competes head-on with MGTC's free calculator as an acquisition funnel; the decision coach + multi-standard reports are the paid upgrade. ESG tool spend is often tax-deductible.</div>
        </>
      )}

      {invite && (
        <Modal title="Invite team member" onClose={() => setInvite(null)} actions={[{ label: 'Cancel', kind: 'ghost', onClick: () => setInvite(null) }, { label: 'Send invite', onClick: sendInvite }]}>
          <div className="wz">
            <div className="field"><label>Name</label><input value={iv.n} onChange={e => setIv(s => ({ ...s, n: e.target.value }))} placeholder="Full name" /></div>
            <div className="field"><label>Role</label><select value={iv.r} onChange={e => setIv(s => ({ ...s, r: e.target.value }))}><option>Editor</option><option>Viewer</option><option>Owner</option></select></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
