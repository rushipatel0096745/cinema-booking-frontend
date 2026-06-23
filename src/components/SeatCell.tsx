import type { SeatCell as SeatCellType } from '../types'

interface Props {
  seat: SeatCellType
  isSelected: boolean
  onToggle: (id: string, status: SeatCellType['status']) => void
}

const typeStyles: Record<string, string> = {
  recliner: 'rounded-t-xl',
  premium:  'rounded-t-lg',
  standard: 'rounded-t-md',
}

const statusStyles: Record<string, string> = {
  available: 'bg-cinema-card border-cinema-border hover:bg-emerald-900 hover:border-emerald-500 cursor-pointer',
  locked:    'bg-amber-950 border-amber-700 cursor-not-allowed opacity-70',
  booked:    'bg-gray-900 border-gray-700 cursor-not-allowed opacity-40',
}

const selectedStyle = 'bg-emerald-700 border-emerald-400 cursor-pointer'

export default function SeatCell({ seat, isSelected, onToggle }: Props) {
  if (seat.is_aisle) {
    return <div className="w-7 h-7" />
  }

  const base = 'w-7 h-7 border text-[9px] flex items-center justify-center transition-all duration-150 select-none'
  const shape = typeStyles[seat.type] ?? 'rounded-t-md'
  const state = isSelected ? selectedStyle : statusStyles[seat.status]

  return (
    <button
      className={`${base} ${shape} ${state}`}
      onClick={() => onToggle(seat.id, seat.status)}
      disabled={seat.status !== 'available'}
      title={`${seat.type} — ₹${seat.price}`}
      aria-label={`Seat col ${seat.col}, ${seat.type}, ₹${seat.price}, ${seat.status}`}
      aria-pressed={isSelected}
    />
  )
}