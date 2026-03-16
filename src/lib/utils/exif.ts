import exifr from 'exifr'

export interface ExifResult {
  latitude: number | null
  longitude: number | null
  capturedAt: string | null
  cameraMake: string | null
  cameraModel: string | null
  raw: Record<string, unknown>
}

const EMPTY: ExifResult = {
  latitude: null,
  longitude: null,
  capturedAt: null,
  cameraMake: null,
  cameraModel: null,
  raw: {},
}

export async function extractExif(file: File): Promise<ExifResult> {
  try {
    const data = await exifr.parse(file, {
      gps: true,
      exif: true,
      tiff: true,
    })
    if (!data) return EMPTY

    return {
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      capturedAt: data.DateTimeOriginal
        ? new Date(data.DateTimeOriginal).toISOString()
        : null,
      cameraMake: data.Make ?? null,
      cameraModel: data.Model ?? null,
      raw: data,
    }
  } catch {
    return EMPTY
  }
}
