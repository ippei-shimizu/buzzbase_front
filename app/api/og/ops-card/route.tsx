/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "nodejs";

let bgImageBase64: string | null = null;
let logoImageBase64: string | null = null;

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
  return fonts;
}

function formatStat(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "-";
  const fixed = value.toFixed(3);
  return value < 1 ? fixed.replace(/^0/, "") : fixed;
}

type LevelKey = "S" | "A" | "B" | "C";

function classifyOpsLevel(ops: number): {
  key: LevelKey;
  label: string;
  color: string;
} {
  if (ops >= 1.0) return { key: "S", label: "リーグ代表級", color: "#f59e0b" };
  if (ops >= 0.9) return { key: "A", label: "中心打者級", color: "#fbbf24" };
  if (ops >= 0.8) return { key: "B", label: "好打者", color: "#facc15" };
  if (ops >= 0.7) return { key: "C", label: "平均的", color: "#a3a3a3" };
  return { key: "C", label: "要改善", color: "#737373" };
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(42, 42, 42, 0.85)",
        border: "1px solid rgba(113, 113, 122, 0.3)",
        borderRadius: "14px",
        padding: "20px 16px",
        flex: 1,
      }}
    >
      <span style={{ fontSize: "20px", color: "#a1a1aa", marginBottom: "6px" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: "56px",
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "0.5px",
        }}
      >
        {value}
      </span>
    </div>
  );
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
  const ops = parseStat(searchParams.get("ops"));
  const obp = parseStat(searchParams.get("obp"));
  const slg = parseStat(searchParams.get("slg"));

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

  const level = ops !== null ? classifyOpsLevel(ops) : null;

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
            marginBottom: "20px",
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
            OPS（オーピーエス）計算結果
          </span>
          {level ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: level.color,
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
            padding: "32px 40px",
            marginBottom: "24px",
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
                fontSize: "24px",
                color: "#a1a1aa",
                marginBottom: "8px",
              }}
            >
              OPS
            </span>
            <span
              style={{
                fontSize: "120px",
                fontWeight: 700,
                color: "#fbbf24",
                lineHeight: 1,
              }}
            >
              {formatStat(ops)}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <StatBox label="出塁率（OBP）" value={formatStat(obp)} />
          <StatBox label="長打率（SLG）" value={formatStat(slg)} />
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
