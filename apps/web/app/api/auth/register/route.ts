import { RegisterSchemaType } from "@repo/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterSchemaType;
    const registerReq = await fetch(
      `${process.env.BACKEND_URL}/auth/register`,
      {
        method: "POST",
        body: JSON.stringify(body),
        cache: "no-cache",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!registerReq.ok) {
      const errorBody = await registerReq.json();

      return NextResponse.json(
        {
          message: errorBody.message || "Kayıt işlemi başarısız",
          error: errorBody.error || "Bad Request",
          statusCode: registerReq.status,
        },
        { status: registerReq.status }
      );
    }

    const authReq = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({
        username: body.email ? body.email : body.phone,
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
    console.error("API Route error:", error);
    return NextResponse.json(
      {
        message: "Sunucu hatası oluştu",
        error: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
