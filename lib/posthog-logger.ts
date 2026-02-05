import posthog from "posthog-js";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Client-side PostHog logger utility.
 * Sends logs as events to PostHog for centralized logging.
 */
export const logger = {
  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext) {
    this._log("debug", message, context);
  },

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext) {
    this._log("info", message, context);
  },

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext) {
    this._log("warn", message, context);
  },

  /**
   * Log an error message
   */
  error(message: string, context?: LogContext) {
    this._log("error", message, context);
  },

  /**
   * Internal log method
   */
  _log(level: LogLevel, message: string, context?: LogContext) {
    // Also log to console for development
    const consoleMethod = level === "debug" ? "log" : level;
    console[consoleMethod](`[${level.toUpperCase()}]`, message, context || "");

    // Send to PostHog
    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.capture("$log", {
        level,
        message,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        ...context,
      });
    }
  },

  /**
   * Track a user interaction with detailed context
   */
  trackInteraction(action: string, context?: LogContext) {
    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.capture("user_interaction", {
        action,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        ...context,
      });
    }
  },

  /**
   * Track LLM-specific events from the client
   */
  trackLLMInteraction(context: {
    type: "request_sent" | "response_received" | "error";
    model?: string;
    messageLength?: number;
    responseTimeMs?: number;
    error?: string;
  }) {
    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.capture("client_llm_interaction", {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        ...context,
      });
    }
  },

  /**
   * Track page-specific events
   */
  trackPageEvent(eventName: string, context?: LogContext) {
    if (typeof window !== "undefined" && posthog.__loaded) {
      posthog.capture(eventName, {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        pathname: window.location.pathname,
        ...context,
      });
    }
  },
};

export default logger;
