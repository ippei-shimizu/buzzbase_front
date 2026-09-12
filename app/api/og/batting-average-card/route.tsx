/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { classifyBattingAverage } from "@app/data/baseball-stats/battingAverageLevel";

export const runtime = "nodejs";

let bgImageBase64: string | null = null;
let logoImageBase64: string | null = null;
let cachedFonts: { data: ArrayBuffer; weight: 400 | 700 }[] | null = null;

async function getStaticImage(
  fileName: string,
  cache: { get: () => string | null; set: (v: string) => void },
): Promise<string> {
  const cached = cache.get();
  if (cached) return cached;
  const filePath = join(process.cwd(), "public", "images", fileName);
  const buffer = await readFile(filePath);
  const base64 = `data:image/png;base64,${buffer.toString("base64")}`;
  cache.set(base64);
  return base64;
}

function getBackgroundImage(): Promise<string> {
  return getStaticImage("og-bg.png", {
    get: () => bgImageBase64,
    set: (v) => {
      bgImageBase64 = v;
    },
  });
}

function getLogoImage(): Promise<string> {
  return getStaticImage("buzz-logo-v2.png", {
    get: () => logoImageBase64,
    set: (v) => {
      logoImageBase64 = v;
    },
  });
}

async function fetchFonts(): Promise<
  { data: ArrayBuffer; weight: 400 | 700 }[]
> {
  if (cachedFonts) return cachedFonts;
  const res = await fetch(
    "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap",
  );
  const css = await res.text();
  const fontUrls = Array.from(
    css.matchAll(
      /font-weight:\s*(\d+);[^}]*src:\s*url\(([^)]+)\)\s*format\('(?:woff2|truetype|opentype)'\)/g,
    ),
  );
  if (fontUrls.length === 0) {
    throw new Error("Font URLs not found");
  }
  const fonts = await Promise.all(
    fontUrls.map(async (match) => {
      const weight = Number(match[1]) as 400 | 700;
      const fontRes = await fetch(match[2]);
      return { data: await fontRes.arrayBuffer(), weight };
    }),
  );
  cachedFonts = fonts;
  return fonts;
}

function formatAvg(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "-";
  const fixed = value.toFixed(3);
  return value < 1 ? fixed.replace(/^0/, "") : fixed;
}

function BgImage({ src }: { src: string }) {
  return (
    <img
      src={src}
      width={1200}
      height={630}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1200,
        height: 630,
        objectFit: "cover",
      }}
    />
  );
}

function parseStat(raw: string | null): number | null {
  if (raw === null) return null;
  const parsed = Number.parseFloat(raw);
  if (Number.isNaN(parsed)) return null;
  return parsed;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const avg = parseStat(searchParams.get("avg"));

  let fonts: { data: ArrayBuffer; weight: 400 | 700 }[];
  let bgSrc: string;
  let logoSrc: string;
  try {
    [fonts, bgSrc, logoSrc] = await Promise.all([
      fetchFonts(),
      getBackgroundImage(),
      getLogoImage(),
    ]);
  } catch {
    return new Response("Asset loading failed", { status: 500 });
  }

  const level = avg !== null ? classifyBattingAverage(avg) : null;

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: '"Noto Sans JP"',
          padding: "48px 60px",
          position: "relative",
        }}
      >
        <BgImage src={bgSrc} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "26px",
              color: "#e08e0a",
              fontWeight: 700,
              letterSpacing: "1px",
            }}
          >
            打率（AVG）計算結果
          </span>
          {level ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: level.ogColor,
                color: "#1c1917",
                padding: "8px 20px",
                borderRadius: "999px",
                fontSize: "22px",
                fontWeight: 700,
              }}
            >
              {level.key} / {level.label}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(42, 42, 42, 0.9)",
            border: "2px solid rgba(224, 142, 10, 0.6)",
            borderRadius: "20px",
            padding: "60px 40px",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "32px",
                color: "#a1a1aa",
                marginBottom: "12px",
              }}
            >
              打率 AVG
            </span>
            <span
              style={{
                fontSize: "180px",
                fontWeight: 700,
                color: "#fbbf24",
                lineHeight: 1,
              }}
            >
              {formatAvg(avg)}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "24px",
            right: "60px",
            alignItems: "center",
          }}
        >
          <img src={logoSrc} height={48} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.map((f) => ({
        name: "Noto Sans JP",
        data: f.data,
        weight: f.weight,
        style: "normal" as const,
      })),
    },
  );

  response.headers.set("Cache-Control", "public, max-age=3600");
  return response;
}
