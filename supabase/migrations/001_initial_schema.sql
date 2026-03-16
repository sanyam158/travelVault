-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  name        text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. TRIPS TABLE
-- ============================================================
CREATE TABLE public.trips (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            text NOT NULL,
  subtitle         text,
  cover_image_url  text,
  start_date       date,
  end_date         date,
  media_count      int NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_trips_user_id ON public.trips(user_id);

-- ============================================================
-- 3. MEDIA TABLE
-- ============================================================
CREATE TABLE public.media (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id          uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  file_url         text NOT NULL,
  thumbnail_url    text,
  type             text NOT NULL CHECK (type IN ('photo', 'video')),
  caption          text,
  location_name    text,
  latitude         float,
  longitude        float,
  sort_order       int NOT NULL DEFAULT 0,
  exif_data        jsonb,
  ken_burns_config jsonb,
  captured_at      timestamptz,
  uploaded_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_trip_id ON public.media(trip_id);

-- ============================================================
-- 4. TRIGGER: auto-create profile on new auth user
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. TRIGGER: keep trips.media_count in sync
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_trip_media_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.trips
    SET media_count = media_count + 1,
        updated_at  = now()
    WHERE id = NEW.trip_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.trips
    SET media_count = GREATEST(media_count - 1, 0),
        updated_at  = now()
    WHERE id = OLD.trip_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_media_change
  AFTER INSERT OR DELETE ON public.media
  FOR EACH ROW EXECUTE FUNCTION public.update_trip_media_count();

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: read own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- trips
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trips: select own"
  ON public.trips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "trips: insert own"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trips: update own"
  ON public.trips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "trips: delete own"
  ON public.trips FOR DELETE
  USING (auth.uid() = user_id);

-- media (join through trips to verify ownership)
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media: select own trips"
  ON public.media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = media.trip_id
        AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "media: insert own trips"
  ON public.media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = media.trip_id
        AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "media: update own trips"
  ON public.media FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = media.trip_id
        AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "media: delete own trips"
  ON public.media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = media.trip_id
        AND trips.user_id = auth.uid()
    )
  );

-- ============================================================
-- 7. STORAGE POLICIES (for 'media' bucket)
-- NOTE: Create the 'media' bucket in Supabase dashboard first:
--   Storage → New bucket → name: media → private
-- Then run these policies.
-- ============================================================

-- Upload: authenticated users can upload to their own folder (user_id/*)
CREATE POLICY "storage: upload own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read: authenticated users can read any file
CREATE POLICY "storage: read authenticated"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'media');

-- Delete: authenticated users can delete only from their own folder
CREATE POLICY "storage: delete own folder"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
