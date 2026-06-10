// Reusable modal. `actions` is an array of { label, kind, onClick } rendered as footer buttons.
export default function Modal({ title, children, actions, onClose }) {
  return (
    <div className="modal-wrap" onClick={(e) => { if (e.target.classList.contains('modal-wrap')) onClose() }}>
      <div className="modal">
        <div className="modal-h"><b>{title}</b><span className="modal-x" onClick={onClose}>×</span></div>
        <div className="modal-b">{children}</div>
        {actions && (
          <div className="modal-f">
            {actions.map((a, i) => (
              <button key={i} className={'btn ' + (a.kind === 'ghost' ? 'ghost ' : '') + 'sm'} onClick={a.onClick}>{a.label}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
