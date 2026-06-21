import { NextResponse } from 'next/server'
import { fetchDoorPrices } from '@/lib/api/door-prices'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await fetchDoorPrices()
    return NextResponse.json({
      ok: true,
      count: Object.keys(result.prices).length,
      lastUpdated: result.lastUpdated,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
