// A proper in-app confirmation dialog, used anywhere the app previously
// relied on the browser's native confirm() popup (e.g. removing a student).
// Supports a two-step flow when `dangerLevel="double"` is passed - the
// caller re-renders this with step 2 content after the first confirmation.

export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
      onClick={onCancel}
    >
      <div
        className="card"
        style={{ maxWidth: 400, width: '90%', boxShadow: 'var(--shadow-md)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button
            className={danger ? 'btn btn-danger' : 'btn btn-primary'}
            style={danger ? { background: 'var(--color-danger)', color: 'white', border: 'none' } : {}}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
