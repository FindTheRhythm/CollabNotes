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
      // Log full error details to console for easy copying
      console.error("Full Error Details:", toast.details);

      const detailsStr = JSON.stringify(toast.details, null, 2);

      // Try copying to clipboard; if unavailable, open a new window with the details
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(detailsStr).then(() => {
          console.log("Error details copied to clipboard");
        }).catch(() => {
          const w = window.open("", "_blank");
          if (w) {
            w.document.write(`<pre>${detailsStr.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`);
            w.document.title = "Error Details";
          } else {
            console.warn("Unable to open new window to show details");
          }
        });
      } else {
        const w = window.open("", "_blank");
        if (w) {
          w.document.write(`<pre>${detailsStr.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`);
          w.document.title = "Error Details";
        } else {
          console.warn("Unable to open new window to show details");
        }
      }
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
