import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const {
    data: { user },
    error
  } = await admin.auth.admin.getUserByEmail(email)

  if (error || !user) {
    // Don't reveal whether the email exists
    return NextResponse.json({ success: true })
  }

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  await admin.from('password_reset_tokens').insert({
    user_id: user.id,
    token,
    expires_at: expiresAt
  })

  // TODO: send email with link containing the token
  console.log('Password reset token for', email, token)

  return NextResponse.json({ success: true })
}
