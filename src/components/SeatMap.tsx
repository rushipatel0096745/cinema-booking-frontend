import { useSeatStore } from '../store/seatStore'
import SeatCell from './SeatCell'
import type { SeatCell as SeatCellType } from '../types'

export default function SeatMap() {
  const { seatMap, selectedIds, toggleSeat } = useSeatStore()

  if (!seatMap) return null

  return (
    <div className="w-full overflow-x-auto">
      {/* screen */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-3/4 h-1 bg-gradient-to-r from-transparent via-cinema-accent to-transparent rounded-full mb-1" />
        <span className="text-cinema-muted text-xs tracking-[0.2em] uppercase">Screen</span>
      </div>

      {/* legend */}
      <div className="flex gap-5 justify-center mb-6 flex-wrap">
        {[
          { label: 'Available',  className: 'bg-cinema-card border border-cinema-border' },
          { label: 'Selected',   className: 'bg-emerald-700 border border-emerald-400' },
          { label: 'Locked',     className: 'bg-amber-950 border border-amber-700' },
          { label: 'Booked',     className: 'bg-gray-900 border border-gray-700 opacity-40' },
        ].map(({ label, className }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-sm ${className}`} />
            <span className="text-cinema-muted text-xs">{label}</span>
          </div>
        ))}
      </div>

      {/* seat type legend */}
      <div className="flex gap-5 justify-center mb-8 flex-wrap">
        {[
          { label: 'Standard',  note: '1×' },
          { label: 'Premium',   note: '1.5×' },
          { label: 'Recliner',  note: '2×' },
        ].map(({ label, note }) => (
          <span key={label} className="text-cinema-muted text-xs">
            <span className="text-white">{label}</span> {note} price
          </span>
        ))}
      </div>

      {/* rows */}
      <div className="flex flex-col gap-1.5 items-center">
        {seatMap.rows.map((row) => (
          <div key={row.label} className="flex gap-1.5 items-center">
            {/* row label left */}
            <span className="text-cinema-muted text-xs w-5 text-right flex-shrink-0">
              {row.label}
            </span>

            {/* seats */}
            <div className="flex gap-1">
              {row.seats.map((seat) => (
                <SeatCell
                  key={seat.is_aisle ? `aisle-${seat.col}` : seat.id}
                  seat={seat}
                  isSelected={selectedIds.has(seat.id)}
                  onToggle={(id, status) => toggleSeat(id, status as SeatCellType['status'])}
                />
              ))}
            </div>

            {/* row label right */}
            <span className="text-cinema-muted text-xs w-5 flex-shrink-0">
              {row.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}