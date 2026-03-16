'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Media } from '@/types'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        style={{ opacity: 0.2, marginBottom: 28 }}
      >
        <rect
          x="8"
          y="20"
          width="56"
          height="40"
          rx="6"
          stroke="#d4a574"
          strokeWidth="1.5"
        />
        <circle cx="36" cy="40" r="10" stroke="#d4a574" strokeWidth="1.5" />
        <circle cx="36" cy="40" r="4" fill="#d4a574" />
        <path
          d="M26 20v-4a4 4 0 014-4h12a4 4 0 014 4v4"
          stroke="#d4a574"
          strokeWidth="1.5"
        />
        <circle cx="52" cy="28" r="2" fill="#d4a574" />
      </svg>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 300,
          color: '#f0e6d6',
          opacity: 0.6,
          marginBottom: 10,
        }}
      >
        No memories yet.
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          color: '#f0e6d6',
          opacity: 0.35,
        }}
      >
        Drop photos here or click to upload.
      </p>
    </div>
  )
}

interface CardProps {
  m: Media
  onEdit: (m: Media) => void
  onSelect: (id: string) => void
  selected: boolean
  anySelected: boolean
}

function SortableMediaCard({
  m,
  onEdit,
  onSelect,
  selected,
  anySelected,
}: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: m.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      {/* Card image area — drag handle */}
      <div
        {...listeners}
        className="relative aspect-square overflow-hidden rounded-lg cursor-grab active:cursor-grabbing"
        style={{
          outline: selected
            ? '2px solid #d4a574'
            : '2px solid transparent',
          outlineOffset: 2,
        }}
      >
        <Image
          src={m.file_url}
          fill
          alt={m.caption || ''}
          className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Video overlay */}
        {m.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 40,
                height: 40,
                background: 'rgba(0,0,0,0.6)',
                border: '1.5px solid rgba(240,230,214,0.3)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 2.5l8 4.5-8 4.5V2.5z" fill="#f0e6d6" />
              </svg>
            </div>
          </div>
        )}

        {/* Selection checkbox */}
        <button
          className="absolute top-2 left-2 w-5 h-5 rounded flex items-center justify-center transition-all"
          style={{
            opacity: anySelected || selected ? 1 : 0,
            background: selected
              ? '#d4a574'
              : 'rgba(0,0,0,0.5)',
            border: `1.5px solid ${selected ? '#d4a574' : 'rgba(240,230,214,0.3)'}`,
            pointerEvents: 'auto',
          }}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(m.id)
          }}
        >
          {selected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path
                d="M1 4l3 3 5-6"
                stroke="#0a0a0a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Edit button */}
        <button
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid rgba(240,230,214,0.2)',
            pointerEvents: 'auto',
          }}
          onClick={(e) => {
            e.stopPropagation()
            onEdit(m)
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M8.5 1.5l2 2M1 11l.7-2.8L9 .9l2 2-7.3 7.3L1 11z"
              stroke="#f0e6d6"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Caption */}
      {m.caption && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.78rem',
            color: '#f0e6d6',
            opacity: 0.6,
            marginTop: 6,
            lineHeight: 1.4,
          }}
          className="truncate"
        >
          {m.caption}
        </p>
      )}

      {/* Location */}
      {m.location_name && (
        <div className="flex items-center gap-1 mt-0.5" style={{ opacity: 0.4 }}>
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <path
              d="M5 1C3.34 1 2 2.34 2 4c0 2.25 3 5 3 5s3-2.75 3-5c0-1.66-1.34-3-3-3zm0 4a1 1 0 110-2 1 1 0 010 2z"
              fill="#d4a574"
            />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.68rem',
              color: '#d4a574',
            }}
            className="truncate"
          >
            {m.location_name}
          </span>
        </div>
      )}
    </motion.div>
  )
}

interface Props {
  media: Media[]
  onEdit: (m: Media) => void
  onSelect: (id: string) => void
  selectedIds: Set<string>
  onReorder: (orderedIds: string[]) => void
}

export default function MediaGrid({
  media,
  onEdit,
  onSelect,
  selectedIds,
  onReorder,
}: Props) {
  const [items, setItems] = useState<Media[]>(media)

  // Keep in sync when server data changes
  if (
    media.length !== items.length ||
    media.some((m, i) => m.id !== items[i]?.id || m.caption !== items[i]?.caption || m.location_name !== items[i]?.location_name)
  ) {
    setItems(media)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // require 8px movement before drag starts (allows clicks)
      },
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((m) => m.id === active.id)
    const newIndex = items.findIndex((m) => m.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    setItems(reordered)
    onReorder(reordered.map((m) => m.id))
  }

  if (items.length === 0) return <EmptyState />

  const anySelected = selectedIds.size > 0

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((m) => m.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-28">
          {items.map((m) => (
            <SortableMediaCard
              key={m.id}
              m={m}
              onEdit={onEdit}
              onSelect={onSelect}
              selected={selectedIds.has(m.id)}
              anySelected={anySelected}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
