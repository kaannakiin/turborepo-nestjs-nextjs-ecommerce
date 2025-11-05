import { TokenPayload } from "@repo/types";
import { cookies, headers } from "next/headers";
import { cache } from "react";

export const getSession = async (): Promise<TokenPayload | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const payloadFetch = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: { Cookie: `token=${token}` },
      credentials: "include",
      cache: "no-store",
    });

    if (!payloadFetch.ok) return null;
    return await payloadFetch.json();
  } catch {
    return null;
  }
};
