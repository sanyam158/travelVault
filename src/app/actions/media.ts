'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { KenBurnsConfig } from '@/types'

export async function insertMedia(data: {
  trip_id: string
  file_url: string
  type: 'photo' | 'video'
  captured_at: string | null
  latitude: number | null
  longitude: number | null
  exif_data: Record<string, unknown> | null
  sort_order: number
  ken_burns_config: KenBurnsConfig | null
}): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify trip ownership
  const { data: trip } = await supabase
    .from('trips')
    .select('id')
    .eq('id', data.trip_id)
    .eq('user_id', user.id)
    .single()
  if (!trip) throw new Error('Trip not found')

  const { data: media, error } = await supabase
    .from('media')
    .insert({
      trip_id: data.trip_id,
      file_url: data.file_url,
      type: data.type,
      captured_at: data.captured_at,
      latitude: data.latitude,
      longitude: data.longitude,
      exif_data: data.exif_data,
      sort_order: data.sort_order,
      ken_burns_config: data.ken_burns_config,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/trip/${data.trip_id}`)
  return media.id
}
