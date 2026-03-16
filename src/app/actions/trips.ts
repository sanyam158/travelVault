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
