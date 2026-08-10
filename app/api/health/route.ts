import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  try {
    const supabase = createPublicClient()
    const { error } = await supabase.from('categories').select('id').limit(1)

    const latency = Date.now() - startTime

    if (error) {
      return NextResponse.json(
        { status: 'degraded', database: 'error', message: error.message, latency: `${latency}ms` },
        { status: 503 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      latency: `${latency}ms`,
      uptime: process.uptime(),
    })
  } catch (err: any) {
    return NextResponse.json(
      { status: 'unhealthy', error: err.message, latency: `${Date.now() - startTime}ms` },
      { status: 500 }
    )
  }
}
