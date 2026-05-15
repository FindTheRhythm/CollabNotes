import axios, { AxiosError } from "axios";

export interface ErrorDetails {
  statusCode: number;
  message: string;
  errorCode?: string;
  validationErrors?: Record<string, string[]>;
  details?: string;
  timestamp: string;
  path?: string;
  method?: string;
}

/**
 * Parse and extract detailed error information from various error sources
 */
export function parseError(error: unknown): ErrorDetails {
  const timestamp = new Date().toISOString();

  // Axios error
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    const data = axiosError.response?.data;

    return {
      statusCode: axiosError.response?.status || 500,
      message: data?.message || axiosError.message || "Unknown error",
      errorCode: data?.code || data?.errorCode,
      validationErrors: data?.errors || data?.validationErrors,
      details: data?.details,
      timestamp,
      path: axiosError.config?.url,
      method: axiosError.config?.method?.toUpperCase()
    };
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message || "An error occurred",
      timestamp,
      details: error.stack
    };
  }

  // Unknown error
  return {
    statusCode: 500,
    message: String(error) || "An unexpected error occurred",
    timestamp
  };
}

/**
 * Format error for user display
 */
export function formatErrorMessage(error: unknown): string {
  const errorDetails = parseError(error);

  // For validation errors, show specific field errors
  if (errorDetails.validationErrors) {
    const fieldErrors = Object.entries(errorDetails.validationErrors)
      .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
      .join("\n");
    return `Validation failed:\n${fieldErrors}`;
  }

  return errorDetails.message;
}

/**
 * Format error for console logging (development)
 */
export function formatErrorForConsole(error: unknown): string {
  const errorDetails = parseError(error);

  const lines = [
    `🔴 Error [${errorDetails.statusCode}]`,
    `   Message: ${errorDetails.message}`,
  ];

  if (errorDetails.errorCode) {
    lines.push(`   Code: ${errorDetails.errorCode}`);
  }

  if (errorDetails.path) {
    lines.push(`   Path: ${errorDetails.method} ${errorDetails.path}`);
  }

  if (errorDetails.validationErrors) {
    const fieldErrors = Object.entries(errorDetails.validationErrors)
      .map(([field, messages]) => `   - ${field}: ${messages.join(", ")}`)
      .join("\n");
    lines.push(`   Validation Errors:\n${fieldErrors}`);
  }

  if (errorDetails.details) {
    lines.push(`   Details: ${errorDetails.details}`);
  }

  lines.push(`   Time: ${errorDetails.timestamp}`);

  if (errorDetails.details && error instanceof Error) {
    lines.push(`   Stack: ${error.stack}`);
  }

  return lines.join("\n");
}

/**
 * Get appropriate user-friendly message based on status code
 */
export function getErrorUserMessage(statusCode: number, fallback: string): string {
  const messages: Record<number, string> = {
    400: "Invalid request. Please check your input and try again.",
    401: "Your session has expired. Please log in again.",
    403: "You don't have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "This resource already exists or there's a conflict.",
    422: "The data you provided is invalid. Please check and try again.",
    429: "Too many requests. Please wait a moment and try again.",
    500: "Server error. Please try again later.",
    502: "Bad Gateway. The server is temporarily unavailable.",
    503: "Service unavailable. Please try again later.",
    504: "Gateway timeout. The server is taking too long to respond."
  };

  return messages[statusCode] || fallback;
}

/**
 * Log error with full details (only in development)
 */
export function logError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    const message = formatErrorForConsole(error);
    if (context) {
      console.error(`[${context}]`);
    }
    console.error(message);
  }
}

/**
 * Create a user-friendly error notification object
 */
export function createErrorNotification(
  error: unknown,
  context?: string
): {
  title: string;
  message: string;
  details: ErrorDetails;
} {
  const details = parseError(error);
  logError(error, context);

  const title = `Error ${details.statusCode}`;

  let message = details.message;
  if (details.validationErrors) {
    const fieldErrors = Object.entries(details.validationErrors)
      .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
      .join("\n");
    message = `Validation Error:\n${fieldErrors}`;
  } else {
    message = getErrorUserMessage(
      details.statusCode,
      details.message
    );
  }

  return {
    title,
    message,
    details
  };
}
