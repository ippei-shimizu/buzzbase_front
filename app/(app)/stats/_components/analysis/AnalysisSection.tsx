import type { ProFeature, ProStatus } from "@app/types/pro";
import { Suspense } from "react";
import { getCachedProStatus } from "@app/(app)/pro/proStatus";
import { DEFAULT_PRO_STATUS } from "@app/types/pro";
import {
  getCountSituations,
  getInitialAnalysisData,
  getPitcherFaceoffs,
  getPitchTypes,
} from "../../analysisActions";
import { getStatsFilterOptions } from "../../filterOptions";
import { AnalysisContainer, type ProAnalysisData } from "./AnalysisContainer";
import { AnalysisLoading } from "./AnalysisLoading";

/**
 * 打撃分析セクション（Server Component）。
 * 初期データをサーバーで取得して `AnalysisContainer` に渡し、取得が終わるまでは
 * セクション内のインラインローディングをストリーミング表示する。
 * これによりシェル（ヘッダ/タブ/テーブル）は即描画され、分析だけ後から差し込まれる。
 */
export function AnalysisSection() {
  return (
    <Suspense fallback={<AnalysisLoading />}>
      <AnalysisDataProvider />
    </Suspense>
  );
}

/** Pro 限定ブロックの SSR 結果と、その時点で閲覧を許可された機能。 */
interface ResolvedProAnalysis {
  data: ProAnalysisData;
  grantedFeatures: ProFeature[];
}

/**
 * entitlement を持つ Pro 限定ブロックだけをサーバーで取得する。
 * 403 が返った機能は grantedFeatures から外し、クライアントが同じ 403 を
 * もう一度踏まないようにする。
 */
async function resolveProAnalysis(
  proStatusPromise: Promise<ProStatus | null>,
): Promise<ResolvedProAnalysis> {
  const proStatus = await proStatusPromise;
  const entitlements =
    proStatus?.entitlements ?? DEFAULT_PRO_STATUS.entitlements;
  const isEntitled = (feature: ProFeature) => entitlements.includes(feature);

  const grantedFeatures: ProFeature[] = isEntitled("hit_direction_average")
    ? ["hit_direction_average"]
    : [];

  const [counts, pitches, faceoffs] = await Promise.all([
    isEntitled("count_situation_average") ? getCountSituations() : null,
    isEntitled("pitch_type_average") ? getPitchTypes() : null,
    isEntitled("pitcher_faceoff_average") ? getPitcherFaceoffs() : null,
  ]);

  const data: ProAnalysisData = {
    countSituations: null,
    pitchTypes: null,
    pitcherFaceoffs: null,
  };
  if (counts?.status === "ok") {
    data.countSituations = counts.data;
    grantedFeatures.push("count_situation_average");
  }
  if (pitches?.status === "ok") {
    data.pitchTypes = pitches.data;
    grantedFeatures.push("pitch_type_average");
  }
  if (faceoffs?.status === "ok") {
    data.pitcherFaceoffs = faceoffs.data;
    grantedFeatures.push("pitcher_faceoff_average");
  }

  return { data, grantedFeatures };
}

async function AnalysisDataProvider() {
  // /stats は認証チェックで既に dynamic なので、Pro 判定もサーバーで解決できる。
  // Pro 限定ブロックは判定を待たないと取得可否が決まらないため、その待ち時間が
  // 他ブロックの取得と重なるよう Promise.all に同居させる。
  const proStatusPromise = getCachedProStatus();
  const [initialData, filterOptions, pro] = await Promise.all([
    getInitialAnalysisData(),
    getStatsFilterOptions(),
    resolveProAnalysis(proStatusPromise),
  ]);

  return (
    <AnalysisContainer
      initialData={initialData}
      initialProData={pro.data}
      initialProFeatures={pro.grantedFeatures}
      seasonOptions={filterOptions.seasonOptions}
      tournamentOptions={filterOptions.tournamentOptions}
    />
  );
}
