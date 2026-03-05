"use server";

import type { SeasonData } from "@app/interface";
import { cookies } from "next/headers";
import { RAILS_API_URL } from "@app/constants/api";

async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access-token")?.value;
  const client = cookieStore.get("client")?.value;
  const uid = cookieStore.get("uid")?.value;

  if (!accessToken || !client || !uid) return null;

  return {
    "Content-Type": "application/json",
    "access-token": accessToken,
    client,
    uid,
  };
}

export async function getSeasonsServer(): Promise<SeasonData[]> {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return [];

    const url = `${RAILS_API_URL}/api/v1/seasons`;
    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching seasons:", error);
    return [];
  }
}
