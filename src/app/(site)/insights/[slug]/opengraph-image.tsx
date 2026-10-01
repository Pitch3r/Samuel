import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { getPublishedArticle } from "@/lib/articles";
import { loadOgAssets, OgArc, ogSize } from "@/lib/og";

export const alt = "Primeresearch Consultants insight";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, { logo, fonts }] = await Promise.all([getPublishedArticle(slug), loadOgAssets()]);
  const title = article?.title ?? "Insights from Primeresearch";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0B2447", padding: "64px 72px", position: "relative", fontFamily: "Inter" }}>
        <OgArc />
        <img src={logo} width={300} height={67} alt="" />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          <div style={{ display: "flex", alignItems: "center", fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: 22, letterSpacing: 4, color: "#E4AC3F", textTransform: "uppercase" }}>
            <div style={{ width: 36, height: 3, background: "#E4AC3F", marginRight: 16 }} />
            {article?.category ?? "Insights"}
          </div>
          <div style={{ display: "flex", marginTop: 24, fontFamily: "Plus Jakarta Sans", fontWeight: 700, fontSize: title.length > 60 ? 58 : 68, lineHeight: 1.08, letterSpacing: -2, color: "#FFFFFF" }}>
            {title}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "rgba(255,255,255,0.6)" }}>
          <span>Insights · {site.shortName}</span>
          <span>{site.url.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
