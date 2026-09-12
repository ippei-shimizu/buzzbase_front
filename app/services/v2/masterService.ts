"use server";

import type {
  AppearanceSituationMaster,
  ArmAngleMaster,
  ContactQualityMaster,
  PitcherStyleMaster,
  PitchTypeMaster,
  TimingMaster,
  VelocityZoneMaster,
} from "@app/interface/plateAppearanceMasters";
import { RAILS_API_URL } from "@app/constants/api";
import { captureServerActionError } from "../../../lib/sentry-helpers";
import { getAuthHeaders } from "./authHeaders";

// 各マスタ API は { "<resourceKey>": MasterItem[] } を返す。
// 取得失敗時は空配列を返す（UI 側で fallback）。
async function fetchMaster<T>(
  path: string,
  responseKey: string,
  action: string,
): Promise<T[]> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return [];

    const response = await fetch(`${RAILS_API_URL}/api/v2/${path}`, {
      headers,
      cache: "no-store",
    });
    if (!response.ok) return [];

    const body = await response.json();
    return body[responseKey] ?? [];
  } catch (error) {
    captureServerActionError(error, { action });
    return [];
  }
}

export async function getContactQualities(): Promise<ContactQualityMaster[]> {
  return fetchMaster(
    "contact_qualities",
    "contact_qualities",
    "getContactQualities",
  );
}

export async function getTimings(): Promise<TimingMaster[]> {
  return fetchMaster("timings", "timings", "getTimings");
}

export async function getPitchTypes(): Promise<PitchTypeMaster[]> {
  return fetchMaster("pitch_types", "pitch_types", "getPitchTypes");
}

export async function getArmAngles(): Promise<ArmAngleMaster[]> {
  return fetchMaster("arm_angles", "arm_angles", "getArmAngles");
}

export async function getVelocityZones(): Promise<VelocityZoneMaster[]> {
  return fetchMaster("velocity_zones", "velocity_zones", "getVelocityZones");
}

export async function getPitcherStyles(): Promise<PitcherStyleMaster[]> {
  return fetchMaster("pitcher_styles", "pitcher_styles", "getPitcherStyles");
}

export async function getAppearanceSituations(): Promise<
  AppearanceSituationMaster[]
> {
  return fetchMaster(
    "appearance_situations",
    "appearance_situations",
    "getAppearanceSituations",
  );
}
