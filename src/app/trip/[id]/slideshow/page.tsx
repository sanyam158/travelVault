import { notFound } from 'next/navigation'
import { getTrip, getMediaByTrip } from '@/lib/queries/media'
import SlideshowClient from '@/components/SlideshowClient'

export default async function SlideshowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const trip = await getTrip(id)
  if (!trip) notFound()

  const media = await getMediaByTrip(trip.id)

  return <SlideshowClient trip={trip} media={media} />
}
