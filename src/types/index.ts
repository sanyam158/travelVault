export interface Trip {
  id: string
  user_id: string
  title: string
  subtitle: string | null
  cover_image_url: string | null
  start_date: string | null
  end_date: string | null
  media_count: number
  created_at: string
  updated_at: string
}

export interface KenBurnsConfig {
  startScale: number
  endScale: number
  startX: number
  startY: number
  endX: number
  endY: number
}

export interface Media {
  id: string
  trip_id: string
  file_url: string
  thumbnail_url: string | null
  type: 'photo' | 'video'
  caption: string | null
  location_name: string | null
  latitude: number | null
  longitude: number | null
  sort_order: number
  exif_data: Record<string, unknown> | null
  ken_burns_config: KenBurnsConfig | null
  captured_at: string | null
  uploaded_at: string
}

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
}
