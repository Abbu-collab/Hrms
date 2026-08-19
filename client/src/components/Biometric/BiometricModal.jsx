import React, { useState, useRef } from "react";
import FaceCamera from "./FaceCamera";
import { verifyFace } from "../../services/biometricService";
import { autoBiometricAttendance } from "../../services/attendanceService";
import { FiX, FiCheckCircle, FiAlertCircle, FiShield, FiClock } from "react-icons/fi";
import "./BiometricModal.css";

export default function BiometricModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const [resultInfo, setResultInfo] = useState(null);

  // In-progress guard to prevent double submissions
  const isSubmittingRef = useRef(false);

  if (!isOpen) return null;

  const handleFaceVerified = async (faceEmbedding) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setVerifying(true);
    setError("");

    try {
      // 1. Verify face with backend -> returns short-lived biometricToken
      const verifyRes = await verifyFace(faceEmbedding);

      if (!verifyRes.success || !verifyRes.biometricToken) {
        throw new Error(verifyRes.message || "Biometric verification failed.");
      }

      setVerifying(false);
      setSubmitting(true);

      // 2. Call automatic biometric attendance API
      const attRes = await autoBiometricAttendance(verifyRes.biometricToken);

      setSubmitting(false);
      setCompleted(true);
      setResultInfo(attRes);

      setTimeout(() => {
        if (onSuccess) onSuccess(attRes);
        handleClose();
      }, 2500);
    } catch (err) {
      isSubmittingRef.current = false;
      setVerifying(false);
      setSubmitting(false);
      const msg = err.response?.data?.message || err.message || "Verification failed. Please try again.";
      setError(msg);
    }
  };

  const handleClose = () => {
    isSubmittingRef.current = false;
    setVerifying(false);
    setSubmitting(false);
    setCompleted(false);
    setError("");
    setResultInfo(null);
    onClose();
  };

  return (
    <div className="biometric-modal-backdrop" onClick={handleClose}>
      <div
        className="biometric-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="biometric-modal-header">
          <div className="biometric-modal-title-group">
            <div className="biometric-modal-icon-badge">
              <FiShield size={18} />
            </div>
            <div>
              <h3 className="biometric-modal-title">Live Face Attendance</h3>
              <p className="biometric-modal-subtitle">
                Automatic Biometric Verification & Attendance Logging
              </p>
            </div>
          </div>
          <button
            type="button"
            className="biometric-modal-close-btn"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="biometric-modal-body">
          {completed ? (
            <div className="biometric-success-view">
              <div className="biometric-success-icon-wrap">
                <FiCheckCircle size={48} className="biometric-success-icon" />
              </div>
              <h4>{resultInfo?.message || "Biometric Verification Completed"}</h4>
              <p className="biometric-success-sub">
                Your identity was verified with active liveness check.
              </p>

              {resultInfo?.data && (
                <div className="biometric-receipt-card">
                  <div className="biometric-receipt-row">
                    <span>
                      <FiClock size={13} /> Time:
                    </span>
                    <strong>
                      {new Date(
                        resultInfo.action === "CHECK_IN"
                          ? resultInfo.data.checkIn
                          : resultInfo.data.checkOut || Date.now()
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </strong>
                  </div>
                  <div className="biometric-receipt-row">
                    <span>Action:</span>
                    <span className="biometric-method-badge">
                      {resultInfo.action === "CHECK_IN"
                        ? "Check-In Recorded ✓"
                        : resultInfo.action === "CHECK_OUT"
                        ? "Check-Out Recorded ✓"
                        : "Day Complete ✓"}
                    </span>
                  </div>
                  <div className="biometric-receipt-row">
                    <span>Liveness:</span>
                    <span className="biometric-method-badge">Verified ✓</span>
                  </div>
                </div>
              )}
            </div>
          ) : verifying || submitting ? (
            <div className="biometric-processing-view">
              <div className="biometric-spinner-lg" />
              <h4>
                {verifying
                  ? "Verifying Face Identity..."
                  : "Logging Attendance Record..."}
              </h4>
              <p>Please hold still while security check completes.</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="biometric-alert-error">
                  <FiAlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <FaceCamera
                mode="verify"
                onFaceVerified={handleFaceVerified}
                onError={(err) => setError(err)}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="biometric-modal-footer">
          <span className="biometric-footer-security-note">
            🔒 Secure JWT-bound biometric authentication
          </span>
          <button
            type="button"
            className="biometric-btn-cancel"
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
