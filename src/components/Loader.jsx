import React from "react";

export const Loader = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#f5f7fa",
      color: "#1976d2",
      fontFamily: "Segoe UI, Arial, sans-serif",
      fontWeight: 600,
      fontSize: 22,
      letterSpacing: 1,
    }}
  >
    <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
    <div style={{ fontSize: 28, marginBottom: 8 }}>GC Balance Checker</div>
    <div style={{ fontSize: 16, color: "#333" }}>
      by IMONISA OGHENEKEVWE BRIAN
    </div>
  </div>
);
