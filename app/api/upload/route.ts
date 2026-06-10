import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file     = formData.get('file') as File
    const bucket   = (formData.get('bucket') as string) || 'offer-images'
    const path     = formData.get('path') as string

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const supabase  = createAdminClient()
    const bytes     = await file.arrayBuffer()
    const buffer    = Buffer.from(bytes)
    const ext       = file.name.split('.').pop() ?? 'jpg'
    const filePath  = path || `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl, path: filePath })

  } catch (err: any) {
    console.error('Upload API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
