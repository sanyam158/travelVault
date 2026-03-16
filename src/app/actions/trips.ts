'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTrip(formData: {
  title: string
  subtitle?: string
  start_date?: string
  end_date?: string
  cover_image_url?: string
}): Promise<string> {
  if (!formData.title?.trim()) {
    throw new Error('Title is required')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: user.id,
      title: formData.title.trim(),
      subtitle: formData.subtitle?.trim() || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      cover_image_url: formData.cover_image_url || null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  return data.id
}

export async function updateTrip(
  tripId: string,
  fields: {
    title?: string
    subtitle?: string | null
    start_date?: string | null
    end_date?: string | null
    cover_image_url?: string | null
  }
): Promise<void> {
  if (fields.title !== undefined && !fields.title.trim()) {
    throw new Error('Title is required')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const update: Record<string, unknown> = {}
  if (fields.title !== undefined) update.title = fields.title.trim()
  if ('subtitle' in fields) update.subtitle = fields.subtitle?.trim() || null
  if ('start_date' in fields) update.start_date = fields.start_date || null
  if ('end_date' in fields) update.end_date = fields.end_date || null
  if ('cover_image_url' in fields)
    update.cover_image_url = fields.cover_image_url || null

  const { error } = await supabase
    .from('trips')
    .update(update)
    .eq('id', tripId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath(`/trip/${tripId}`)
}

export async function deleteTrip(tripId: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify ownership and get user_id for storage cleanup
  const { data: trip } = await supabase
    .from('trips')
    .select('id, user_id')
    .eq('id', tripId)
    .eq('user_id', user.id)
    .single()
  if (!trip) throw new Error('Trip not found')

  // Try to remove all storage files for this trip
  try {
    const { data: files } = await supabase.storage
      .from('media')
      .list(`${user.id}/trips/${tripId}`)
    if (files && files.length > 0) {
      const paths = files.map(
        (f) => `${user.id}/trips/${tripId}/${f.name}`
      )
      await supabase.storage.from('media').remove(paths)
    }
  } catch {
    // Storage cleanup best-effort; proceed with DB delete
  }

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
}
