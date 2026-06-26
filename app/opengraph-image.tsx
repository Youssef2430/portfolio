import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Youssef Chouay · Software Engineer & AI Researcher";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#c9a86a",
            marginBottom: 24,
          }}
        >
          Portfolio
        </div>
        <div style={{ fontSize: 72, fontWeight: 300, marginBottom: 16 }}>
          Youssef Chouay
        </div>
        <div style={{ fontSize: 32, color: "#a3a3a3" }}>
          Software Engineer &amp; AI Researcher
        </div>
      </div>
    ),
    size
  );
}
