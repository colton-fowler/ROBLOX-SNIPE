import { AppError } from "../types/errors";
import "./ErrorBanner.css";

interface ErrorBannerProps {
  error: AppError;
  onDismiss?: () => void;
}

const ERROR_ICONS: Record<AppError["code"], string> = {
  USER_NOT_FOUND: "🔍",
  USER_OFFLINE: "💤",
  USER_PRIVATE: "🔒",
  JOINS_DISABLED: "⛔",
  RATE_LIMITED: "⏳",
  NETWORK_ERROR: "📡",
  UNKNOWN: "⚠️",
};

/** Displays a typed error with icon and optional detail */
export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  return (
    <div className={`error-banner error-banner--${error.code.toLowerCase()}`} role="alert">
      <span className="error-banner__icon" aria-hidden>
        {ERROR_ICONS[error.code]}
      </span>
      <div className="error-banner__body">
        <p className="error-banner__message">{error.message}</p>
        {error.detail && (
          <p className="error-banner__detail">{error.detail}</p>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="error-banner__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
}
