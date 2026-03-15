/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

const RAILS_API_URL =
  process.env.RAILS_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://back:3000" : undefined);

export const runtime = "nodejs";

// Cache static assets in memory
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

function resolveImageUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  if (url.endsWith(".svg")) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/") && RAILS_API_URL) return `${RAILS_API_URL}${url}`;
  return null;
}

function AvatarCircle({ name, imageUrl }: { name: string; imageUrl?: string }) {
  const resolvedUrl = resolveImageUrl(imageUrl);
  if (resolvedUrl) {
    return (
      <img
        src={resolvedUrl}
        width={88}
        height={88}
        style={{
          borderRadius: "50%",
          border: "3px solid rgba(113, 113, 122, 0.6)",
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: "88px",
        height: "88px",
        borderRadius: "50%",
        backgroundColor: "#3f3f46",
        border: "3px solid rgba(113, 113, 122, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span style={{ fontSize: "28px", color: "#a1a1aa" }}>
        {name?.charAt(0) || "?"}
      </span>
    </div>
  );
}

function StatBox({
  label,
  value,
  size = "normal",
}: {
  label: string;
  value: string | number;
  size?: "normal" | "compact";
}) {
  const isCompact = size === "compact";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(42, 42, 42, 0.85)",
        border: "1px solid rgba(113, 113, 122, 0.3)",
        borderRadius: isCompact ? "8px" : "12px",
        padding: isCompact ? "10px 8px" : "16px 12px",
        flex: 1,
        minWidth: isCompact ? "80px" : "120px",
      }}
    >
      <span
        style={{
          fontSize: isCompact ? "12px" : "14px",
          color: "#a1a1aa",
          marginBottom: "2px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: isCompact ? "24px" : "32px",
          fontWeight: 700,
          color: "#ffffff",
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

function FallbackCard(
  fonts: { data: ArrayBuffer; weight: 400 | 700 }[],
  bgSrc: string,
  logoSrc: string,
) {
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
          fontFamily: '"Noto Sans JP"',
          position: "relative",
        }}
      >
        <BgImage src={bgSrc} />
        <img src={logoSrc} height={60} style={{ marginBottom: "16px" }} />
        <span style={{ fontSize: "24px", color: "#a1a1aa", marginTop: "8px" }}>
          野球の個人成績をシェアしよう
        </span>
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
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("userId");

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

  if (!userId || !RAILS_API_URL) {
    return FallbackCard(fonts, bgSrc, logoSrc);
  }

  try {
    // 1. Get user data by user_id slug
    const userRes = await fetch(
      `${RAILS_API_URL}/api/v1/users/show_user_id_data?user_id=${encodeURIComponent(userId)}`,
      { next: { revalidate: 3600 } },
    );
    if (!userRes.ok) {
      return FallbackCard(fonts, bgSrc, logoSrc);
    }
    const userData = await userRes.json();
    const user = userData.user;
    const numericId = user.id;
    const isPrivate =
      userData.is_private && userData.follow_status !== "following";

    // 2. Get team data
    let teamName = "";
    let categoryName = "";
    try {
      const teamRes = await fetch(
        `${RAILS_API_URL}/api/v1/teams/${encodeURIComponent(userId)}/my_team`,
        { next: { revalidate: 3600 } },
      );
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        teamName = teamData.name || "";
        categoryName = teamData.category_name || "";
      }
    } catch {
      // Team data is optional
    }

    const positionName =
      user.positions && user.positions.length > 0 ? user.positions[0].name : "";

    const subInfo = [teamName, categoryName, positionName]
      .filter(Boolean)
      .join(" | ");

    // 3. If private, show name only card
    if (isPrivate) {
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
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <BgImage src={bgSrc} />
            <div style={{ marginBottom: "16px", display: "flex" }}>
              <AvatarCircle
                name={user.name}
                imageUrl={user.image?.url || user.image}
              />
            </div>
            <span
              style={{ fontSize: "36px", fontWeight: 700, color: "#ffffff" }}
            >
              {user.name}
            </span>
            <span
              style={{
                fontSize: "20px",
                color: "#a1a1aa",
                marginTop: "12px",
              }}
            >
              このアカウントは非公開です
            </span>
            <div
              style={{
                position: "absolute",
                bottom: "24px",
                right: "60px",
                display: "flex",
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

    // 4. Get stats data (current year) - fetch both batting and pitching
    const currentYear = new Date().getFullYear();

    type StatItem = { label: string; value: string | number };
    let battingRow: StatItem[] = [];
    let pitchingRow: StatItem[] = [];
    let hasBatting = false;
    let hasPitching = false;

    const [batAvgRes, batStatsRes, pitResultRes, pitStatsRes] =
      await Promise.all([
        fetch(
          `${RAILS_API_URL}/api/v1/batting_averages/personal_batting_average?user_id=${numericId}&year=${currentYear}`,
          { next: { revalidate: 3600 } },
        ).catch(() => null),
        fetch(
          `${RAILS_API_URL}/api/v1/batting_averages/personal_batting_stats?user_id=${numericId}&year=${currentYear}`,
          { next: { revalidate: 3600 } },
        ).catch(() => null),
        fetch(
          `${RAILS_API_URL}/api/v1/pitching_results/personal_pitching_result?user_id=${numericId}&year=${currentYear}`,
          { next: { revalidate: 3600 } },
        ).catch(() => null),
        fetch(
          `${RAILS_API_URL}/api/v1/pitching_results/personal_pitching_stats?user_id=${numericId}&year=${currentYear}`,
          { next: { revalidate: 3600 } },
        ).catch(() => null),
      ]);

    // Process batting
    const batAverages = batAvgRes && batAvgRes.ok ? await batAvgRes.json() : [];
    const batStats =
      batStatsRes && batStatsRes.ok ? await batStatsRes.json() : {};

    if (
      (Array.isArray(batAverages) && batAverages.length > 0) ||
      (batStats && batStats.batting_average != null)
    ) {
      hasBatting = true;
      const totals = Array.isArray(batAverages)
        ? batAverages.reduce(
            (
              acc: {
                home_run: number;
                runs_batted_in: number;
                number_of_matches: number;
                stealing_base: number;
              },
              r: {
                home_run: number;
                runs_batted_in: number;
                number_of_matches: number;
                stealing_base: number;
              },
            ) => ({
              home_run: acc.home_run + (r.home_run || 0),
              runs_batted_in: acc.runs_batted_in + (r.runs_batted_in || 0),
              number_of_matches:
                acc.number_of_matches + (r.number_of_matches || 0),
              stealing_base: acc.stealing_base + (r.stealing_base || 0),
            }),
            {
              home_run: 0,
              runs_batted_in: 0,
              number_of_matches: 0,
              stealing_base: 0,
            },
          )
        : {
            home_run: 0,
            runs_batted_in: 0,
            number_of_matches: 0,
            stealing_base: 0,
          };

      battingRow = [
        {
          label: "打率",
          value:
            batStats.batting_average != null
              ? Number(batStats.batting_average).toFixed(3)
              : "-",
        },
        { label: "本塁打", value: totals.home_run },
        { label: "打点", value: totals.runs_batted_in },
        {
          label: "OPS",
          value: batStats.ops != null ? Number(batStats.ops).toFixed(3) : "-",
        },
        {
          label: "安打",
          value: batStats.total_hits != null ? batStats.total_hits : "-",
        },
        { label: "試合", value: totals.number_of_matches },
      ];
    }

    // Process pitching
    const pitResults =
      pitResultRes && pitResultRes.ok ? await pitResultRes.json() : [];
    const pitStats =
      pitStatsRes && pitStatsRes.ok ? await pitStatsRes.json() : {};

    if (
      (Array.isArray(pitResults) && pitResults.length > 0) ||
      (pitStats && pitStats.era != null)
    ) {
      hasPitching = true;
      const totals = Array.isArray(pitResults)
        ? pitResults.reduce(
            (
              acc: {
                win: number;
                loss: number;
                saves: number;
                strikeouts: number;
                innings_pitched: number;
              },
              r: {
                win: number;
                loss: number;
                saves: number;
                strikeouts: number;
                innings_pitched: number;
              },
            ) => ({
              win: acc.win + (r.win || 0),
              loss: acc.loss + (r.loss || 0),
              saves: acc.saves + (r.saves || 0),
              strikeouts: acc.strikeouts + (r.strikeouts || 0),
              innings_pitched: acc.innings_pitched + (r.innings_pitched || 0),
            }),
            { win: 0, loss: 0, saves: 0, strikeouts: 0, innings_pitched: 0 },
          )
        : { win: 0, loss: 0, saves: 0, strikeouts: 0, innings_pitched: 0 };

      pitchingRow = [
        {
          label: "防御率",
          value: pitStats.era != null ? Number(pitStats.era).toFixed(2) : "-",
        },
        { label: "勝利", value: totals.win },
        { label: "敗北", value: totals.loss },
        { label: "奪三振", value: totals.strikeouts },
        {
          label: "WHIP",
          value: pitStats.whip != null ? Number(pitStats.whip).toFixed(2) : "-",
        },
        { label: "投球回", value: totals.innings_pitched },
      ];
    }

    if (!hasBatting && !hasPitching) {
      return FallbackCard(fonts, bgSrc, logoSrc);
    }

    const isBothTypes = hasBatting && hasPitching;
    const statBoxSize = isBothTypes ? "compact" : "normal";

    const response = new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            fontFamily: '"Noto Sans JP"',
            padding: isBothTypes ? "32px 48px" : "48px 60px",
            position: "relative",
          }}
        >
          <BgImage src={bgSrc} />

          {/* Header: avatar + name + year */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: isBothTypes ? "20px" : "40px",
            }}
          >
            <div style={{ marginRight: "20px", display: "flex" }}>
              <AvatarCircle
                name={user.name}
                imageUrl={user.image?.url || user.image}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: isBothTypes ? "30px" : "34px",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "0.5px",
                }}
              >
                {user.name}
              </span>
              {subInfo && (
                <span
                  style={{
                    fontSize: "17px",
                    color: "#a1a1aa",
                    marginTop: "4px",
                  }}
                >
                  {subInfo}
                </span>
              )}
            </div>
          </div>

          {/* Batting stats */}
          {hasBatting && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: isBothTypes ? "12px" : "16px",
              }}
            >
              <span
                style={{
                  fontSize: "17px",
                  color: "#e08e0a",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                打撃成績
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                {battingRow.slice(0, 3).map((stat) => (
                  <StatBox
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    size={statBoxSize}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                {battingRow.slice(3).map((stat) => (
                  <StatBox
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    size={statBoxSize}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pitching stats */}
          {hasPitching && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: isBothTypes ? "12px" : "16px",
              }}
            >
              <span
                style={{
                  fontSize: "17px",
                  color: "#e08e0a",
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                投手成績
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                {pitchingRow.slice(0, 3).map((stat) => (
                  <StatBox
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    size={statBoxSize}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                {pitchingRow.slice(3).map((stat) => (
                  <StatBox
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    size={statBoxSize}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer: logo right-aligned */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              bottom: "20px",
              right: "48px",
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
  } catch {
    return FallbackCard(fonts, bgSrc, logoSrc);
  }
}
