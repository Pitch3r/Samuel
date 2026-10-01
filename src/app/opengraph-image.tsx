import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { loadOgAssets, OgArc, ogSize } from "@/lib/og";

export const alt = `${site.name}: ${site.aim}`;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  const { logo, fonts } = await loadOgAssets();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0B2447", padding: "64px 72px", position: "relative", fontFamily: "Inter" }}>
        <OgArc />
        <img src={logo} width={330} height={74} alt="" />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 820 }}>
          <div style={{ display: "flex", fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 84, lineHeight: 1.02, letterSpacing: -3, color: "#FFFFFF", flexWrap: "wrap" }}>
            <span>Every decision deserves&nbsp;</span>
            <span style={{ color: "#E4AC3F" }}>evidence.</span>
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
            Market research · Opinion polling · Evaluation · Data analysis
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "rgba(255,255,255,0.6)" }}>
          <span>{site.tagline}</span>
          <span>{site.url.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
