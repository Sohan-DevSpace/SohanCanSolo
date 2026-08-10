import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function handleSignOut(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  const requestUrl = new URL(request.url)
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`, {
    status: 302,
  })
}

export async function GET(request: Request) {
  return handleSignOut(request)
}

export async function POST(request: Request) {
  return handleSignOut(request)
}
