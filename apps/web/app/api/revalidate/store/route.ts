import { STORE_CONFIG_CACHE_TAG } from '@lib/store-config';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!REVALIDATE_SECRET || token !== REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidateTag(STORE_CONFIG_CACHE_TAG, 'page');

  return NextResponse.json({
    success: true,
    message: 'Store config cache invalidated',
    timestamp: new Date().toISOString(),
  });
}
