import { useContext } from "react";
import { ToastContext } from "@/components/Notifications/ToastContainer";
import { createErrorNotification, parseError } from "@/utils/errorHandler";

export function useToast() {
  const toastContext = useContext(ToastContext);

  if (!toastContext) {
    throw new Error("useToast must be used within ToastContainer");
  }

  return {
    ...toastContext,

    /**
     * Show error notification with full details
     */
    showError: (error: unknown, errorContext?: string, duration: number = 6000) => {
      const notification = createErrorNotification(error, errorContext);
      toastContext.addToast({
        type: "error",
        title: notification.title,
        message: notification.message,
        duration,
        details: notification.details
      });
    },

    /**
     * Show success notification
     */
    showSuccess: (message: string, title: string = "Success", duration: number = 3000) => {
      toastContext.addToast({
        type: "success",
        title,
        message,
        duration
      });
    },

    /**
     * Show info notification
     */
    showInfo: (message: string, title: string = "Info", duration: number = 4000) => {
      toastContext.addToast({
        type: "info",
        title,
        message,
        duration
      });
    },

    /**
     * Show warning notification
     */
    showWarning: (message: string, title: string = "Warning", duration: number = 5000) => {
      toastContext.addToast({
        type: "warning",
        title,
        message,
        duration
      });
    },

    /**
     * Show validation error with field details
     */
    showValidationError: (error: unknown) => {
      const errorDetails = parseError(error);

      if (errorDetails.validationErrors) {
        const fieldErrors = Object.entries(errorDetails.validationErrors)
          .map(([field, messages]) => `• ${field}: ${messages.join(", ")}`)
          .join("\n");

        toastContext.addToast({
          type: "error",
          title: "Validation Error",
          message: `Please fix the following fields:\n\n${fieldErrors}`,
          duration: 7000,
          details: errorDetails
        });
      } else {
        toastContext.addToast({
          type: "error",
          title: "Error",
          message: errorDetails.message,
          duration: 5000,
          details: errorDetails
        });
      }
    }
  };
}
