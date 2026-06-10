// lightweight toast (appends to #toasts, created on demand)
export function toast(msg, ic = '◆') {
  let box = document.getElementById('toasts')
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; document.body.appendChild(box) }
  const t = document.createElement('div')
  t.className = 'toast'
  t.innerHTML = `<span class="ti">${ic}</span> ${msg}`
  box.appendChild(t)
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = '.3s'; setTimeout(() => t.remove(), 300) }, 2600)
}

export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
