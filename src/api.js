// Tiny API client for the FastAPI backend.
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
let token = localStorage.getItem('cd_token') || null

export function getToken() { return token }
export function setToken(t) {
  token = t
  if (t) localStorage.setItem('cd_token', t); else localStorage.removeItem('cd_token')
}

async function req(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth && token) headers['Authorization'] = 'Bearer ' + token
  let r
  try {
    r = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch (e) {
    throw new Error('Cannot reach the server — is the backend running on :8000?')
  }
  if (r.status === 401 && auth) { setToken(null); window.location.reload(); return }
  let data = null
  try { data = await r.json() } catch (e) { /* no body */ }
  if (!r.ok) throw new Error((data && data.detail) || ('Request failed (' + r.status + ')'))
  return data
}

export const api = {
  register: (d) => req('/api/auth/register', { method: 'POST', body: d }),
  login: (d) => req('/api/auth/login', { method: 'POST', body: d }),
  me: () => req('/api/auth/me', { auth: true }),
  calc: (inputs, suppliers) => req('/api/calc', { method: 'POST', body: { inputs, suppliers } }),
  saveAssessment: (d) => req('/api/assessments', { method: 'POST', body: d, auth: true }),
  listAssessments: () => req('/api/assessments', { auth: true }),
  listSuppliers: () => req('/api/suppliers', { auth: true }),
  addSupplier: (d) => req('/api/suppliers', { method: 'POST', body: d, auth: true }),
  updateSupplier: (id, d) => req('/api/suppliers/' + id, { method: 'PUT', body: d, auth: true }),
  deleteSupplier: (id) => req('/api/suppliers/' + id, { method: 'DELETE', auth: true }),
  listFacilities: () => req('/api/facilities', { auth: true }),
  addFacility: (d) => req('/api/facilities', { method: 'POST', body: d, auth: true }),
  deleteFacility: (id) => req('/api/facilities/' + id, { method: 'DELETE', auth: true }),
  getFactors: () => req('/api/factors', { auth: true }),
  saveFactors: (factors) => req('/api/factors', { method: 'PUT', body: { factors }, auth: true }),
}
