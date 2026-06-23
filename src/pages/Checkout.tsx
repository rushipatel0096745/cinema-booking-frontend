import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useBookingStore } from "../store/bookingStore";
import BookingTimer from "../components/BookingTimer";
import { createBooking } from "../api/bookings";
import type { SeatCell } from "../types";

export default function Checkout() {
    const { showtimeId } = useParams<{ showtimeId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const movie = location.state?.movie;
    const showtime = location.state?.showtime;
    // Seats passed directly from SeatPicker at lock time — avoids Zustand selectedIds timing issues
    const selectedSeats: SeatCell[] = location.state?.lockedSeats ?? [];

    const { setBooking } = useBookingStore();

    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // price breakdown
    const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
    const convenienceFee = +(subtotal * 0.02).toFixed(2);
    const taxes = +((subtotal + convenienceFee) * 0.18).toFixed(2);
    const grandTotal = +(subtotal + convenienceFee + taxes).toFixed(2);

    const handleConfirmAndPay = async () => {
        if (!showtimeId || selectedSeats.length === 0) return;
        setIsCreating(true);
        setError(null);

        try {
            const seatIds = selectedSeats.map((s) => s.id);
            const res = await createBooking(showtimeId, seatIds);
            setBooking(res.booking_id, res.client_secret, res.stripe_publishable_key);
            navigate(`/payment/${res.booking_id}`, {
                state: { movie, showtime, clientSecret: res.client_secret, publishableKey: res.stripe_publishable_key },
            });
        } catch (err: any) {
            setError(err?.response?.data?.error ?? "Failed to create booking. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleTimerExpired = () => {
        navigate(`/showtimes/${showtimeId}/seats`, {
            state: { movie },
            replace: true,
        });
    };

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    const seatTypeLabel: Record<string, string> = {
        standard: "Standard",
        premium: "Premium",
        recliner: "Recliner",
    };

    return (
        <div className='min-h-screen bg-cinema-bg text-white'>
            {/* top bar */}
            <div className='sticky top-0 z-10 bg-cinema-surface border-b border-cinema-border'>
                <div className='max-w-2xl mx-auto px-4 py-3 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <button onClick={() => navigate(-1)} className='text-cinema-muted hover:text-white'>
                            ← Back
                        </button>
                        <span className='font-semibold'>Order Summary</span>
                    </div>
                    <BookingTimer onExpired={handleTimerExpired} />
                </div>
            </div>

            <div className='max-w-2xl mx-auto px-4 py-8 space-y-4'>
                {error && (
                    <div className='px-4 py-3 bg-red-950 border border-red-800 rounded-lg text-red-300 text-sm'>
                        {error}
                    </div>
                )}

                {/* movie + showtime info */}
                <div className='bg-cinema-card border border-cinema-border rounded-xl p-5'>
                    <div className='flex gap-4'>
                        {movie?.poster_url && (
                            <img
                                src={movie.poster_url}
                                alt={movie.title}
                                className='w-16 h-24 object-cover rounded-lg flex-shrink-0'
                            />
                        )}
                        <div className='min-w-0'>
                            <h2 className='font-semibold text-lg truncate'>{movie?.title}</h2>
                            <p className='text-cinema-muted text-sm mt-1'>
                                {movie?.language} · {movie?.duration_mins} mins
                            </p>
                            {showtime && (
                                <>
                                    <p className='text-sm mt-2'>{showtime.theatre?.name}</p>
                                    <p className='text-cinema-muted text-sm'>{showtime.hall?.name}</p>
                                    <p className='text-sm mt-1 text-emerald-400'>
                                        {formatDate(showtime.starts_at)} at {formatTime(showtime.starts_at)}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* seats breakdown */}
                <div className='bg-cinema-card border border-cinema-border rounded-xl overflow-hidden'>
                    <div className='px-5 py-4 border-b border-cinema-border'>
                        <h3 className='font-medium'>
                            {selectedSeats.length} Seat{selectedSeats.length !== 1 ? "s" : ""}
                        </h3>
                    </div>
                    {selectedSeats.map((seat) => (
                        <div
                            key={seat.id}
                            className='flex items-center justify-between px-5 py-3 border-b border-cinema-border last:border-0'>
                            <div className='flex items-center gap-3'>
                                <span className='text-sm font-medium'>
                                    {/* we don't have row label here easily — show col */}
                                    Seat {seat.col}
                                </span>
                                <span className='text-xs px-2 py-0.5 rounded-full bg-cinema-surface text-cinema-muted capitalize'>
                                    {seatTypeLabel[seat.type] ?? seat.type}
                                </span>
                            </div>
                            <span className='text-sm'>₹{seat.price.toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                {/* price summary */}
                <div className='bg-cinema-card border border-cinema-border rounded-xl overflow-hidden'>
                    <div className='px-5 py-4 border-b border-cinema-border'>
                        <h3 className='font-medium'>Price Breakdown</h3>
                    </div>
                    <div className='px-5 py-4 space-y-3'>
                        <div className='flex justify-between text-sm'>
                            <span className='text-cinema-muted'>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-cinema-muted'>Convenience fee (2%)</span>
                            <span>₹{convenienceFee.toFixed(2)}</span>
                        </div>
                        <div className='flex justify-between text-sm'>
                            <span className='text-cinema-muted'>GST (18%)</span>
                            <span>₹{taxes.toFixed(2)}</span>
                        </div>
                        <div className='border-t border-cinema-border pt-3 flex justify-between font-semibold'>
                            <span>Total</span>
                            <span className='text-lg'>₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* cancellation policy */}
                <p className='text-cinema-muted text-xs text-center px-4'>
                    Free cancellation up to 2 hours before showtime. Refund within 5 business days.
                </p>

                {/* pay button */}
                <button
                    onClick={handleConfirmAndPay}
                    disabled={isCreating || selectedSeats.length === 0}
                    className='w-full py-4 bg-cinema-accent hover:bg-red-700 disabled:opacity-50
                     disabled:cursor-not-allowed rounded-xl font-semibold text-lg
                     transition-colors'>
                    {isCreating ? "Processing..." : `Pay ₹${grandTotal.toFixed(2)}`}
                </button>
            </div>
        </div>
    );
}
