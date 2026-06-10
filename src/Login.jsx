import { useState } from 'react'
import { api, setToken } from './api.js'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('ops@creativebliss.my')
  const [pw, setPw] = useState('demo1234')
  const [company, setCompany] = useState('Creative Bliss Sdn Bhd')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const res = mode === 'login'
        ? await api.login({ email, password: pw })
        : await api.register({ email, password: pw, company_name: company })
      setToken(res.token)
      onLogin()
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth-brand">
        <div className="logo" />
        <div>
          <h1>Your carbon number,<br />and the <span>one fix</span><br />that pays for itself.</h1>
          <p>Upload the data you already have. Get your footprint, the single change that saves the most ringgit, and the exact report your buyer or regulator demands — in 30 seconds, not 3 weeks.</p>
          <div className="ftrs">
            <div className="ftr"><span className="c">📐</span> GHG Protocol engine · Scope 1/2/3</div>
            <div className="ftr"><span className="c">🧭</span> Rule-based "what to fix first" coach</div>
            <div className="ftr"><span className="c">📄</span> IFRS S2 &amp; CBAM-ready reports</div>
          </div>
        </div>
        <small>BUILT FOR MALAYSIAN SME MANUFACTURERS</small>
      </div>

      <div className="auth-form">
        <div className="auth-card">
          <form onSubmit={submit}>
            <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <div className="sub">{mode === 'login' ? 'Sign in to your Carbon workspace.' : 'Start your first carbon assessment in minutes.'}</div>
            {mode === 'signup' && (
              <div className="field"><label>Company name</label><input value={company} onChange={e => setCompany(e.target.value)} placeholder="Creative Bliss Sdn Bhd" /></div>
            )}
            <div className="field"><label>Work email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ops@yourfactory.com" /></div>
            <div className="field"><label>Password</label><input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" /></div>
            {err && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{err}</div>}
            <button className="btn full" type="submit" disabled={busy}>{busy ? 'Please wait…' : (mode === 'login' ? 'Sign in →' : 'Create account →')}</button>
            <div className="seg">
              {mode === 'login'
                ? <>New here? <a onClick={() => { setMode('signup'); setErr('') }}>Create an account</a></>
                : <>Already have an account? <a onClick={() => { setMode('login'); setErr('') }}>Sign in</a></>}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
