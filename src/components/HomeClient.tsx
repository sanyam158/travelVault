'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TripGrid from './TripGrid'
import NewTripButton from './NewTripButton'
import CreateTripModal from './CreateTripModal'
import type { Trip } from '@/types'

interface Props {
  trips: Trip[]
  userId: string
}

export default function HomeClient({ trips, userId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <TripGrid trips={trips} onOpenModal={() => setIsOpen(true)} />
      <NewTripButton onClick={() => setIsOpen(true)} />
      <CreateTripModal
        open={isOpen}
        userId={userId}
        onClose={() => setIsOpen(false)}
        onSuccess={(id) => {
          setIsOpen(false)
          router.push(`/trip/${id}`)
        }}
      />
    </>
  )
}
