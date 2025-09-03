import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const googleReq = await fetch(
      `${process.env.BACKEND_URL}/auth/google/callback`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-cache",
      }
    );
    if (!googleReq.ok) {
      console.log("Google auth failed", googleReq.statusText);
      const errorMessage = await googleReq.text();
      console.log(errorMessage);
      return NextResponse.json(
        { message: "Google auth failed", error: errorMessage },
        { status: 500 }
      );
    }
    const response = await googleReq.json();
    console.log(response);
    return NextResponse.json(
      {
        message: "",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
