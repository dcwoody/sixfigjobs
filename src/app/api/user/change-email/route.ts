import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { newEmail } = await req.json()
  if (!newEmail || typeof newEmail !== 'string') {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  const admin = createAdminClient()
  const { error } = await admin.from('email_change_tokens').insert({
    user_id: session.user.id,
    new_email: newEmail,
    token,
    expires_at: expiresAt
  })

  if (error) {
    console.error('Error storing token', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }

  // TODO: Send verification email containing the token
  console.log('Email change token for', newEmail, token)

  return NextResponse.json({ success: true })
}
