import React from "react";

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100dvh",
            background: "#faf7f0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
            textAlign: "center",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Cross */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            style={{ marginBottom: 20 }}
          >
            <rect x="20" y="4" width="8" height="40" rx="2" fill="#8b4513" />
            <rect x="6" y="16" width="36" height="8" rx="2" fill="#8b4513" />
          </svg>

          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#2c1810",
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              fontSize: 13,
              color: "#9a7a58",
              lineHeight: 1.6,
              maxWidth: 320,
              marginBottom: 28,
            }}
          >
            The app encountered an unexpected error. Your intentions and prayer
            data are safe. Please refresh to continue.
          </p>

          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#8b4513",
              color: "#fff",
              border: "none",
              borderRadius: 30,
              padding: "12px 28px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.02em",
              marginBottom: 16,
            }}
          >
            Refresh App
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              background: "transparent",
              color: "#c8b090",
              border: "1px solid #e8dcc8",
              borderRadius: 30,
              padding: "10px 24px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Clear Cache & Refresh
          </button>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre
              style={{
                marginTop: 24,
                padding: 12,
                background: "#f0e8d8",
                border: "1px solid #e8dcc8",
                borderRadius: 8,
                fontSize: 10,
                color: "#6b4c30",
                textAlign: "left",
                maxWidth: 360,
                overflow: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
