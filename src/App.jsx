import { useState } from 'react'
import Login from './Login.jsx'
import Shell from './Shell.jsx'
import { getToken, setToken } from './api.js'

export default function App() {
  const [authed, setAuthed] = useState(!!getToken())
  const logout = () => { setToken(null); setAuthed(false) }
  if (!authed) return <Login onLogin={() => setAuthed(true)} />
  return <Shell onLogout={logout} />
}
