import { useEffect } from "react";
import { useCountdown } from "../hook/useCountdown";
import { useSeatStore } from "../store/seatStore";
import { useBookingStore } from "../store/bookingStore";

interface Props {
    onExpired: () => void;
}

export default function BookingTimer({ onExpired }: Props) {
    const lockExpiresAt = useBookingStore((s) => s.lockExpiresAt);
    const clearSelection = useSeatStore((s) => s.clearSelection);
    const clearBooking = useBookingStore((s) => s.clearBooking);
    const { formatted, isExpired, minutes, seconds } = useCountdown(lockExpiresAt);

    useEffect(() => {
        if (isExpired) {
            clearSelection();
            clearBooking();
            onExpired();
        }
    }, [isExpired]);

    if (!lockExpiresAt) return null;

    const isUrgent = minutes === 0 && seconds <= 60;

    return (
        <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono
      ${isUrgent ? "bg-red-950 border-red-700 text-red-400" : "bg-cinema-card border-cinema-border text-white"}`}>
            <span className={`text-xs ${isUrgent ? "text-red-500" : "text-cinema-muted"}`}>Seats held for</span>
            <span className='font-semibold tabular-nums'>{formatted}</span>
        </div>
    );
}
