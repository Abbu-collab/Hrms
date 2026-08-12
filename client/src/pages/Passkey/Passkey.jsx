import React, { useState } from 'react';
import { verifyPasskey } from '../../services/api';
import './Passkey.css';


function Passkey({ onClose, onSuccess }) {
  const [passkeyValue, setPasskeyValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passkeyValue.trim()) {
      setError('Please enter the passkey');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await verifyPasskey(passkeyValue.trim());

      onSuccess();
    } catch (err) {
      console.error('Passkey verify error:', err);
      setError(err?.message || 'Incorrect passkey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="passkey-overlay" onClick={onClose}>
      <div className="passkey-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Enter Registration Passkey</h3>
        <p className="passkey-subtitle">
          If You Want Register Please Enter Passkey
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="passkey-input"
            placeholder="Enter passkey"
            value={passkeyValue}
            onChange={(e) => setPasskeyValue(e.target.value)}
            autoFocus
          />

          {error && <p className="passkey-error">{error}</p>}

          <div className="passkey-actions">
            <button
              type="button"
              className="passkey-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="passkey-btn-submit"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Passkey;
