import type { VNode } from "freakjs";

interface ButtonProps {
  label: string;
  href?: string;
  children?: VNode[];
}

export function Button({ label, href, children }: ButtonProps) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 20px",
        background: "rgba(124,58,237,0.12)",
        border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: "10px",
        color: "#a78bfa",
        textDecoration: "none",
        fontSize: "0.875rem",
        fontWeight: 500,
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      {label}
      {children}
    </a>
  );
}
