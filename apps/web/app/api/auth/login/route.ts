import { LoginSchemaType } from "@repo/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LoginSchemaType;
    const authReq = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({
        username: body.type === "email" ? body.email : body.phone,
        password: body.password,
      }),
      credentials: "include",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!authReq.ok) {
      const errorResponse = await authReq.json();
      return NextResponse.json(
        { message: errorResponse.message || "Login failed" },
        { status: authReq.status }
      );
    }
    const authSetCookies = authReq.headers.getSetCookie();
    if (authSetCookies) {
      const response = NextResponse.json(
        { message: "Login successful" },
        { status: 200 } // statusText kaldırıldı
      );
      authSetCookies.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
      });
      return response;
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 } // statusText kaldırıldı
    );
  }
}
