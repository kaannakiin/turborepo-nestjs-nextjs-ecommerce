import { TokenPayload } from "@repo/types";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const getSession = async (): Promise<TokenPayload | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const JWT_ACCESS_TOKEN_SECRET = new TextEncoder().encode(
      process.env.JWT_ACCESS_TOKEN_SECRET || "secret-yoksa-patlar"
    );

    const { payload } = await jwtVerify(token, JWT_ACCESS_TOKEN_SECRET);

    return payload as TokenPayload;
  } catch (error) {
    return null;
  }
};
