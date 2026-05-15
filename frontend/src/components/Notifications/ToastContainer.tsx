import React, { useState, useCallback } from "react";
import { Toast, type Toast as ToastType } from "@/components/Notifications/Toast";
import "@/styles/toast.css";

interface ToastContextType {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, "id">) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

interface ToastContainerProps {
  children: React.ReactNode;
}

export function ToastContainer({ children }: ToastContainerProps): React.ReactElement {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = useCallback((toast: Omit<ToastType, "id">) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastType = {
      ...toast,
      id,
      duration: toast.duration ?? 5000 // Default 5 seconds for auto-close
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast if duration is set
    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}

      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
