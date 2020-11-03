import React from "react";

export interface ErrorRendererProps {
  children: React.ReactChild;
}

export const ErrorRenderer = ({ children }: ErrorRendererProps) => (
  <div
    style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

export default ErrorRenderer;
