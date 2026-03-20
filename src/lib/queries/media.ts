import { createClient } from '@/lib/supabase/server'
import type { Trip, Media } from '@/types'

export async function getTrip(tripId: string): Promise<Trip | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single()

  if (error) return null
  return data
}

export async function getMediaByTrip(tripId: string): Promise<Media[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('media')
    .select('id, trip_id, file_url, thumbnail_url, type, caption, location_name, sort_order, ken_burns_config, captured_at, uploaded_at')
    .eq('trip_id', tripId)
    .order('sort_order', { ascending: true })
    .order('captured_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as Media[]
}
