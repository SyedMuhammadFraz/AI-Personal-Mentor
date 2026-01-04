"use client";

type ErrorMessageProps = {
  message: string;
  onDismiss?: () => void;
  className?: string;
};

export function ErrorMessage({ message, onDismiss, className = "" }: ErrorMessageProps) {
  return (
    <div
      className={`bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-3 ${className}`}
      role="alert"
    >
      <div className="flex items-center gap-2 flex-1">
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-300 transition flex-shrink-0"
          aria-label="Dismiss error"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

