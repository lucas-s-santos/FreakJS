import type { PageProps } from "freakjs";

export const metadata = {
  title: "About — FreakJS Starter",
};

export default function About({}: PageProps) {
  return (
    <main style={{ background: "#080808", color: "#fff", minHeight: "100vh", padding: "4rem 2rem", fontFamily: "-apple-system, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>About</h1>
      <p style={{ color: "#888", lineHeight: "1.7" }}>
        This is the about page. Edit{" "}
        <code style={{ color: "#a78bfa" }}>src/pages/about.tsx</code> to change this content.
      </p>
      <a href="/" style={{ display: "inline-block", marginTop: "2rem", color: "#7c3aed" }}>← Back home</a>
    </main>
  );
}
