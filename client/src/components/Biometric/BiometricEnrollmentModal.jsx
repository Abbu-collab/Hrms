import React, { useState } from "react";
import FaceCamera from "./FaceCamera";
import { enrollFace } from "../../services/biometricService";
import { FiX, FiCheckCircle, FiAlertCircle, FiUserCheck } from "react-icons/fi";
import "./BiometricModal.css";

export default function BiometricEnrollmentModal({
  isOpen,
  onClose,
  onEnrolled,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFaceCaptured = async (faceEmbedding) => {
    setSubmitting(true);
    setError("");

    try {
      const res = await enrollFace(faceEmbedding);

      if (!res.success) {
        throw new Error(res.message || "Failed to enroll face biometric.");
      }

      setSubmitting(false);
      setCompleted(true);

      setTimeout(() => {
        if (onEnrolled) onEnrolled(res.data);
        handleClose();
      }, 2000);
    } catch (err) {
      setSubmitting(false);
      const msg = err.response?.data?.message || err.message || "Face registration failed.";
      setError(msg);
    }
  };

  const handleClose = () => {
    setSubmitting(false);
    setCompleted(false);
    setError("");
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
              <FiUserCheck size={18} />
            </div>
            <div>
              <h3 className="biometric-modal-title">Face Biometric Registration</h3>
              <p className="biometric-modal-subtitle">
                Register your face profile for biometric attendance
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

        {/* Body */}
        <div className="biometric-modal-body">
          {completed ? (
            <div className="biometric-success-view">
              <div className="biometric-success-icon-wrap">
                <FiCheckCircle size={48} className="biometric-success-icon" />
              </div>
              <h4>Face Registered Successfully!</h4>
              <p className="biometric-success-sub">
                Your face biometric profile is now active. You can now use Face Check-In and Face Check-Out.
              </p>
            </div>
          ) : submitting ? (
            <div className="biometric-processing-view">
              <div className="biometric-spinner-lg" />
              <h4>Encrypting & Saving Face Profile...</h4>
              <p>Please wait while your biometric embedding is saved securely.</p>
            </div>
          ) : (
            <>
              <div className="biometric-enrollment-instructions">
                <p>
                  <strong>Instructions:</strong> Position your face in the camera frame and complete the active liveness prompt (e.g., blink twice).
                </p>
              </div>

              {error && (
                <div className="biometric-alert-error">
                  <FiAlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <FaceCamera
                mode="enroll"
                onFaceVerified={handleFaceCaptured}
                onError={(err) => setError(err)}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div className="biometric-modal-footer">
          <span className="biometric-footer-security-note">
            🔒 Only 128-d numerical embeddings are stored (No raw images)
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
