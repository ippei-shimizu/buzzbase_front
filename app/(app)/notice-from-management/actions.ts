"use server";

import { captureServerActionError } from "../../../lib/sentry-helpers";
import { RAILS_API_URL } from "../../constants/api";

export interface PublicManagementNotice {
  id: number;
  title: string;
  body: string;
  published_at: string;
}

export async function getPublishedNotices(): Promise<PublicManagementNotice[]> {
  try {
    const response = await fetch(`${RAILS_API_URL}/api/v1/management_notices`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.management_notices ?? [];
  } catch (error) {
    captureServerActionError(error, { action: "getPublishedNotices" });
    console.error("Error fetching published notices:", error);
    return [];
  }
}

export async function getPublishedNotice(
  id: number,
): Promise<PublicManagementNotice | null> {
  try {
    const response = await fetch(
      `${RAILS_API_URL}/api/v1/management_notices/${id}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.management_notice ?? null;
  } catch (error) {
    captureServerActionError(error, { action: "getPublishedNotice" });
    console.error("Error fetching published notice:", error);
    return null;
  }
}
