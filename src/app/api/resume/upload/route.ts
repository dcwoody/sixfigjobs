import { NextRequest, NextResponse } from 'next/server'
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

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  // TODO: send arrayBuffer to parsing service
  const parsedData = {
    skills: [],
    experience: [],
    education: [],
    contact: {}
  }

  const admin = createAdminClient()
  const { error } = await admin.from('user_resumes').upsert({
    user_id: session.user.id,
    original_name: file.name,
    parsed_data: parsedData
  })

  if (error) {
    console.error('Error storing resume', error)
    return NextResponse.json({ error: 'Failed to save resume' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: parsedData })
}
