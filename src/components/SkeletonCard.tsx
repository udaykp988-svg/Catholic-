import React from "react";

interface Props {
  rows?: number;
  showTitle?: boolean;
}

export function SkeletonCard({ rows = 3, showTitle = true }: Props) {
  return (
    <div
      style={{
        background: "#f5f0e8",
        border: "1px solid #e8dcc8",
        borderRadius: 12,
        padding: "20px 20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {/* Label pill */}
      <div className="skeleton" style={{ height: 10, width: 80, marginBottom: 14, borderRadius: 20 }} />

      {/* Title */}
      {showTitle && (
        <div className="skeleton skeleton-title" style={{ borderRadius: 6, marginBottom: 16 }} />
      )}

      {/* Body rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{
            width: i === rows - 1 ? "72%" : "100%",
            borderRadius: 5,
            marginBottom: 10,
          }}
        />
      ))}

      {/* Footer */}
      <div style={{ marginTop: 8, paddingTop: 14, borderTop: "1px solid #e8dcc8", display: "flex", gap: 10 }}>
        <div className="skeleton" style={{ height: 30, width: 90, borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 30, width: 90, borderRadius: 20 }} />
      </div>
    </div>
  );
}
