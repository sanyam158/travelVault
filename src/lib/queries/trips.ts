import { createClient } from '@/lib/supabase/server'
import type { Trip } from '@/types'

export async function getTrips(userId: string): Promise<Trip[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}
