import { ImageResponse } from "next/og";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        fontSize: 24,
        background: "linear-gradient(45deg, #8EC5FC 0%, #E0C3FC 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        borderRadius: "10px",
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a3 3 0 0 0-3-3h0a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3Z" />
        <path d="M14 11a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3v0a3 3 0 0 0-3-3h0a3 3 0 0 0-3 3Z" />
        <path d="M14 11V7a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
        <path d="M10 13v4a2 2 0 0 0 2 2v0a2 2 0 0 0 2-2v-4" />
      </svg>
    </div>,
    {
      ...size,
    },
  );
}
