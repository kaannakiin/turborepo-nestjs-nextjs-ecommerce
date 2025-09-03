"use server";

import { TokenPayload } from "@repo/types";
import { cookies } from "next/headers";

export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const payloadFetch = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
      method: "GET",
      cache: "default",
      headers: {
        Cookie: `token=${token}`,
      },
      credentials: "include",
    });
    if (!payloadFetch.ok) {
      return null;
    }
    const data = (await payloadFetch.json()) as TokenPayload;
    return data;
  } catch {
    return null;
  }
}
