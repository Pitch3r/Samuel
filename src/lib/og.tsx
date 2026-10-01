import { readFile } from "node:fs/promises";
import path from "node:path";
import { arcPath } from "@/lib/geometry";

export const ogSize = { width: 1200, height: 630 };

export async function loadOgAssets() {
  const dir = path.join(process.cwd(), "assets");
  const [bold, semibold, regular, logo] = await Promise.all([
    readFile(path.join(dir, "fonts/PlusJakartaSans-Bold.ttf")),
    readFile(path.join(dir, "fonts/PlusJakartaSans-SemiBold.ttf")),
    readFile(path.join(dir, "fonts/Inter-Regular.ttf")),
    readFile(path.join(dir, "logo-horizontal-reversed-1600.png"), "base64"),
  ]);
  return {
    logo: `data:image/png;base64,${logo}`,
    fonts: [
      { name: "Plus Jakarta Sans", data: bold, weight: 700 as const, style: "normal" as const },
      { name: "Plus Jakarta Sans", data: semibold, weight: 600 as const, style: "normal" as const },
      { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
    ],
  };
}

/** The Prime arc, drawn for the social image, cropped by the right edge. */
export function OgArc() {
  return (
    <svg width="760" height="760" viewBox="0 0 200 200" style={{ position: "absolute", right: -300, top: -120 }}>
      <circle cx="100" cy="100" r="99.4" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.35" />
      <circle cx="100" cy="100" r="78.5" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="15" />
      <path d={arcPath(100, 100, 78.5, 298, 346)} fill="none" stroke="#E4AC3F" strokeWidth="15" />
    </svg>
  );
}
