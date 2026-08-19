import React, { useState } from "react";
import FaceCamera from "./FaceCamera";
import { verifyFace } from "../../services/biometricService";
import { checkIn, checkOut } from "../../services/attendanceService";
import { FiX, FiCheckCircle, FiAlertCircle, FiShield, FiClock } from "react-icons/fi";
import "./BiometricModal.css";

export default function BiometricModal({
  isOpen,
  onClose,
  actionType = "check-in", // "check-in" | "check-out"
  onSuccess,
}) {
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  if (!isOpen) return null;

  const handleFaceVerified = async (faceEmbedding) => {
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

      // 2. Call Check-In or Check-Out API with biometricToken
      let attRes;
      if (actionType === "check-in") {
        attRes = await checkIn({
          remarks: "Biometric Face Check-In",
          biometricToken: verifyRes.biometricToken,
        });
      } else {
        attRes = await checkOut(verifyRes.biometricToken);
      }

      setSubmitting(false);
      setCompleted(true);
      setSuccessInfo(attRes.data);

      setTimeout(() => {
        if (onSuccess) onSuccess(attRes.data);
        handleClose();
      }, 2200);
    } catch (err) {
      setVerifying(false);
      setSubmitting(false);
      const msg = err.response?.data?.message || err.message || "Verification failed. Please try again.";
      setError(msg);
    }
  };

  const handleClose = () => {
    setVerifying(false);
    setSubmitting(false);
    setCompleted(false);
    setError("");
    setSuccessInfo(null);
    onClose();
  };

  const titleText = actionType === "check-in" ? "Face Check-In" : "Face Check-Out";

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
              <h3 className="biometric-modal-title">{titleText}</h3>
              <p className="biometric-modal-subtitle">
                Live Biometric Attendance Verification
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
              <h4>
                {actionType === "check-in"
                  ? "Check-In Successful!"
                  : "Check-Out Successful!"}
              </h4>
              <p className="biometric-success-sub">
                Your identity was verified with active liveness check.
              </p>

              {successInfo && (
                <div className="biometric-receipt-card">
                  <div className="biometric-receipt-row">
                    <span>
                      <FiClock size={13} /> Time:
                    </span>
                    <strong>
                      {new Date(
                        actionType === "check-in"
                          ? successInfo.checkIn
                          : successInfo.checkOut || Date.now()
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </strong>
                  </div>
                  <div className="biometric-receipt-row">
                    <span>Method:</span>
                    <span className="biometric-method-badge">Face Biometric ✓</span>
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
                  ? "Verifying Identity with Server..."
                  : "Recording Attendance Record..."}
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
