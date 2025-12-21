// signOutServer.ts
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@lib/constants";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const signOutServer = async (): Promise<void> => {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  try {
    await fetch(`${process.env.BACKEND_URL}/auth/sign-out`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${ACCESS_TOKEN_COOKIE_NAME}=${accessToken}; ${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`,
      },
    });
    redirect("/auth");
  } catch (error) {
    console.error("Logout error:", error);
  }
};
