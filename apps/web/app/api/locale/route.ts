import { LOCALE_COOKIE_NAME } from '@repo/types';
import { Locale } from '@repo/database/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { locale } = await req.json();

    // Locale validasyonu
    if (!locale || !Object.keys(Locale).includes(locale.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true });

    // Cookie'yi set et
    response.cookies.set(LOCALE_COOKIE_NAME, locale.toUpperCase(), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 yıl
      sameSite: 'lax',
      // httpOnly: false yaparak client-side'dan da okunabilir yapabiliriz
      // Ama POST endpoint kullanacağımız için httpOnly true olabilir
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
