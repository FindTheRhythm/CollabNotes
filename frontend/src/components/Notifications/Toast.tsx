import React, { useEffect } from "react";
import "@/styles/toast.css";

export interface Toast {
  id: string;
  type: "error" | "success" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
  details?: Record<string, any>;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps): React.ReactElement {
  useEffect(() => {
    if (!toast.duration) return;

    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onClose]);

  const handleClose = (): void => {
    onClose(toast.id);
  };

  const handleShowDetails = (): void => {
    if (toast.details) {
      console.log("Toast Details:", toast.details);
      alert(`Full Error Details:\n\n${JSON.stringify(toast.details, null, 2)}`);
    }
  };

  const getIcon = (): string => {
    switch (toast.type) {
      case "error":
        return "❌";
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📌";
    }
  };

  const messageLines = toast.message.split("\n");
  const hasMultipleLines = messageLines.length > 1;

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-header">
        <span className="toast-icon">{getIcon()}</span>
        <span className="toast-title">{toast.title}</span>
        <button className="toast-close" onClick={handleClose} aria-label="Close notification">
          ✕
        </button>
      </div>

      <div className="toast-content">
        {hasMultipleLines ? (
          <pre className="toast-message">{toast.message}</pre>
        ) : (
          <p className="toast-message">{toast.message}</p>
        )}

        {toast.details && (
          <button className="toast-details-btn" onClick={handleShowDetails}>
            Show Details →
          </button>
        )}
      </div>

      {!toast.duration && (
        <div className="toast-progress"></div>
      )}
    </div>
  );
}
