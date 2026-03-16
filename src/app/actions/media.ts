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

export async function updateMediaOrder(
  tripId: string,
  orderedIds: string[]
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify trip ownership
  const { data: trip } = await supabase
    .from('trips')
    .select('id')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single()
  if (!trip) throw new Error('Trip not found')

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('media').update({ sort_order: index }).eq('id', id)
    )
  )

  revalidatePath(`/trip/${tripId}`)
}

export async function updateMedia(
  mediaId: string,
  fields: {
    caption?: string | null
    location_name?: string | null
    ken_burns_config?: KenBurnsConfig | null
  }
): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Fetch media to verify ownership via trip
  const { data: media } = await supabase
    .from('media')
    .select('trip_id')
    .eq('id', mediaId)
    .single()
  if (!media) throw new Error('Media not found')

  const { data: trip } = await supabase
    .from('trips')
    .select('id')
    .eq('id', media.trip_id)
    .eq('user_id', user.id)
    .single()
  if (!trip) throw new Error('Not authorized')

  const { error } = await supabase
    .from('media')
    .update(fields)
    .eq('id', mediaId)

  if (error) throw new Error(error.message)

  revalidatePath(`/trip/${media.trip_id}`)
}

export async function deleteMedia(mediaId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Fetch media to get file_url and verify ownership
  const { data: media } = await supabase
    .from('media')
    .select('file_url, trip_id')
    .eq('id', mediaId)
    .single()
  if (!media) throw new Error('Media not found')

  const { data: trip } = await supabase
    .from('trips')
    .select('id')
    .eq('id', media.trip_id)
    .eq('user_id', user.id)
    .single()
  if (!trip) throw new Error('Not authorized')

  // Remove from storage
  try {
    const url = new URL(media.file_url)
    const path = url.pathname.split('/storage/v1/object/public/media/')[1]
    if (path) {
      await supabase.storage.from('media').remove([path])
    }
  } catch {
    // Continue even if storage removal fails
  }

  const { error } = await supabase.from('media').delete().eq('id', mediaId)
  if (error) throw new Error(error.message)

  revalidatePath(`/trip/${media.trip_id}`)
}

export async function deleteMultipleMedia(mediaIds: string[]): Promise<void> {
  if (mediaIds.length === 0) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Fetch all media items
  const { data: mediaItems } = await supabase
    .from('media')
    .select('id, file_url, trip_id')
    .in('id', mediaIds)

  if (!mediaItems || mediaItems.length === 0) return

  // Verify ownership (all should belong to same trip owned by user)
  const tripId = mediaItems[0].trip_id
  const { data: trip } = await supabase
    .from('trips')
    .select('id')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single()
  if (!trip) throw new Error('Not authorized')

  // Remove from storage
  const paths: string[] = []
  for (const item of mediaItems) {
    try {
      const url = new URL(item.file_url)
      const path = url.pathname.split('/storage/v1/object/public/media/')[1]
      if (path) paths.push(path)
    } catch {
      // Skip invalid URLs
    }
  }
  if (paths.length > 0) {
    await supabase.storage.from('media').remove(paths)
  }

  const { error } = await supabase
    .from('media')
    .delete()
    .in('id', mediaIds)

  if (error) throw new Error(error.message)

  revalidatePath(`/trip/${tripId}`)
}
