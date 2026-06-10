const D = [
  { d: 'Jan', y: '2026', t: 'EU CBAM — definitive phase', tag: ['Applies', 'warn'], p: 'Embedded-emissions charge on EU imports begins. Default values carry a penalty markup that rises over time — reporting verified actuals avoids it.' },
  { d: '2026', y: 'FY', t: 'IFRS S2 (Bursa Malaysia)', tag: ['Applies', 'warn'], p: 'Mandatory for Main Market listed issuers; ACE Market phasing in emissions + transition-plan disclosure. The one going mandatory locally.' },
  { d: 'Apr', y: '2026', t: 'Japan GX-ETS', tag: ['Watch', 's2'], p: 'Mandatory emissions trading begins; carbon surcharge follows. Relevant if you supply Japanese buyers.' },
  { d: '2027', y: 'plan', t: 'UK CBAM', tag: ['Watch', 's2'], p: 'Planned UK border mechanism. Australia, Canada and Turkey exploring similar measures.' },
]
export default function Regulations() {
  return (
    <div className="content">
      <div className="page-head"><div><div className="eyebrow">✦ Why now</div><h2>Regulatory <span>deadlines</span></h2><p>The mechanisms driving demand — and which apply to you.</p></div></div>
      <div className="grid g2">
        <div>
          {D.map((x, i) => (
            <div className="deadline" key={i}>
              <div className="dl-date"><b>{x.d}</b><span>{x.y}</span></div>
              <div><h4>{x.t} <span className={'tag ' + x.tag[1]}>{x.tag[0]}</span></h4><p>{x.p}</p></div>
            </div>
          ))}
        </div>
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <div className="sec-title">The bigger driver</div><div className="sec-sub">Beyond regulation</div>
          <p style={{ fontSize: 13.5, color: 'var(--slate)', lineHeight: 1.65 }}>MNC buyers demand carbon data from suppliers regardless of country — <b style={{ color: 'var(--ink)' }}>Scope 3 supplier pressure</b>. Missing data can cost a contract long before any regulator acts.</p>
          <div className="note">Your exposure: EU shipments (CBAM), Bursa listing path (IFRS S2), and MNC buyers in Penang (Intel, Bosch, B. Braun) requesting Scope 3 data.</div>
        </div>
      </div>
    </div>
  )
}
