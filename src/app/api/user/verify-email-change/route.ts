import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('email_change_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 400 })
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(data.user_id, {
    email: data.new_email
  })

  if (updateError) {
    console.error('Error updating email', updateError)
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
  }

  await admin.from('email_change_tokens').delete().eq('token', token)

  return NextResponse.json({ success: true })
}
