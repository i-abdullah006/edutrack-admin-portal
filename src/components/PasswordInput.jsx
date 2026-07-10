import { useState } from 'react';

// A text input for passwords with a show/hide (eye icon) toggle button.
// Used on both Admin and Student login forms, and anywhere else a password is entered.
export default function PasswordInput({ value, onChange, required, autoFocus, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        className="form-input"
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required={required}
        autoFocus={autoFocus}
        placeholder={placeholder}
        style={{ paddingRight: 44 }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          fontSize: '0.78rem',
          fontWeight: 600,
          padding: '4px 6px',
          cursor: 'pointer'
        }}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
