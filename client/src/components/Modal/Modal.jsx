import React, { useEffect } from 'react';
import './Modal.css';

/**
 * Modal Header Subcomponent
 */
export const ModalHeader = ({ title, onClose, showCloseButton = true, children }) => (
  <div className="hrms-modal-header">
    {title ? <h3 className="hrms-modal-title">{title}</h3> : children}
    {showCloseButton && onClose && (
      <button
        type="button"
        className="hrms-modal-close-btn"
        onClick={onClose}
        aria-label="Close modal"
      >
        ✕
      </button>
    )}
  </div>
);

/**
 * Modal Body Subcomponent
 */
export const ModalBody = ({ children, className = '' }) => (
  <div className={`hrms-modal-body ${className}`}>{children}</div>
);

/**
 * Modal Footer Subcomponent
 */
export const ModalFooter = ({ children, className = '' }) => (
  <div className={`hrms-modal-footer ${className}`}>{children}</div>
);

/**
 * Reusable Accessible Enterprise Modal Component
 */
const Modal = ({
  isOpen = false,
  onClose,
  title = '',
  children,
  footer = null,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = ''
}) => {
  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="hrms-modal-backdrop"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hrms-modal-title"
    >
      <div className={`hrms-modal-dialog hrms-modal-${size} ${className}`}>
        {(title || showCloseButton) && (
          <ModalHeader title={title} onClose={onClose} showCloseButton={showCloseButton} />
        )}
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </div>
    </div>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
