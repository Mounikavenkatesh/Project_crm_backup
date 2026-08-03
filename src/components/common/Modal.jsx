import { useEffect } from 'react';

/**
 * Modal component renders an overlay dialog.
 * Adapts to full screen on mobile, and centered card on desktop/tablet.
 *
 * @param {object} props The component props.
 * @param {boolean} props.isOpen True if modal is visible.
 * @param {Function} props.onClose Callback to close the modal.
 * @param {React.ReactNode} props.children The form content inside.
 * @returns {React.ReactNode} The rendered modal.
 */
export default function Modal({ isOpen, onClose, children }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle ESC key to close
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center outline-none focus:outline-none"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      {/* Responsive layout: Mobile full screen, Tablet+ centered dialog */}
      <div className="relative w-full h-full md:h-auto md:max-w-lg md:mx-auto bg-white dark:bg-gray-900 md:rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-10 overflow-y-auto flex flex-col md:my-8 animate-modal-in">
        <div className="p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
