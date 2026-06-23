// src/pages/BookingDetail.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBooking, cancelBooking } from "../api/bookings";

export default function BookingDetail() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState<string>("");

    const {
        data: booking,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["booking", bookingId],
        queryFn: () => getBooking(bookingId!),
        enabled: !!bookingId,
    });

    const isCancellable = () => {
        if (!booking || booking.status !== "confirmed") return false;
        if (!booking.showtime?.starts_at) return false;
        const twoHoursBefore = new Date(booking.showtime.starts_at).getTime() - 2 * 60 * 60 * 1000;
        return Date.now() < twoHoursBefore;
    };

    const handleCancel = async () => {
        if (!bookingId) return;
        setIsCancelling(true);
        setCancelError(null);

        try {
            await cancelBooking(bookingId);
            // invalidate both the detail and the list
            queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            setShowCancelDialog(false);
        } catch (err: any) {
            setCancelError(err?.response?.data?.error ?? "Failed to cancel. Please try again.");
        } finally {
            setIsCancelling(false);
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    const formatDateTime = (iso: string) =>
        new Date(iso).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    const statusConfig: Record<string, { label: string; className: string }> = {
        confirmed: { label: "Confirmed", className: "bg-emerald-900 text-emerald-400 border-emerald-700" },
        pending: { label: "Pending", className: "bg-amber-900  text-amber-400  border-amber-700" },
        cancelled: { label: "Cancelled", className: "bg-red-900    text-red-400    border-red-700" },
        refunded: { label: "Refunded", className: "bg-gray-800   text-gray-400   border-gray-600" },
    };

    // ── loading ────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className='min-h-screen bg-cinema-bg flex items-center justify-center'>
                <div className='w-8 h-8 border-2 border-cinema-accent border-t-transparent rounded-full animate-spin' />
            </div>
        );
    }

    // ── error ──────────────────────────────────────────────────
    if (error || !booking) {
        return (
            <div className='min-h-screen bg-cinema-bg text-white flex items-center justify-center px-4'>
                <div className='text-center space-y-4'>
                    <p className='text-cinema-muted'>Booking not found.</p>
                    <button
                        onClick={() => navigate("/my-tickets")}
                        className='px-4 py-2 border border-cinema-border rounded-lg text-sm hover:bg-cinema-surface transition-colors'>
                        Back to my tickets
                    </button>
                </div>
            </div>
        );
    }

    const movie = booking.showtime?.movie;
    const theatre = booking.showtime?.theatre;
    const hall = booking.showtime?.hall;
    const showtime = booking.showtime;
    const status = statusConfig[booking.status] ?? statusConfig.pending;
    // const subtotal = booking.seats?.reduce((s, seat) => s + seat.price, 0) ?? booking.total_amount;
    // const convFee = +(subtotal * 0.02).toFixed(2);
    // const taxes = +((subtotal + convFee) * 0.18).toFixed(2);

    const { subtotal, convenience_fee, taxes, total_amount } = booking;

    return (
        <div className='min-h-screen bg-cinema-bg text-white'>
            {/* top bar */}
            <div className='sticky top-0 z-10 bg-cinema-surface border-b border-cinema-border'>
                <div className='max-w-lg mx-auto px-4 py-3 flex items-center gap-3'>
                    <button
                        onClick={() => navigate(-1)}
                        className='text-cinema-muted hover:text-white transition-colors'>
                        ← Back
                    </button>
                    <span className='font-semibold'>Booking Details</span>
                    <span className={`ml-auto text-xs px-2.5 py-1 rounded-full border ${status.className}`}>
                        {status.label}
                    </span>
                </div>
            </div>

            <div className='max-w-lg mx-auto px-4 py-6 space-y-4'>
                {/* ── movie + showtime ──────────────────────────────── */}
                <div className='bg-cinema-card border border-cinema-border rounded-xl overflow-hidden'>
                    {/* banner */}
                    {movie?.poster_url && (
                        <div className='relative h-28 overflow-hidden'>
                            <img
                                src={movie.poster_url}
                                alt={movie.title}
                                className='w-full h-full object-cover opacity-30 blur-sm scale-105'
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-cinema-card via-cinema-card/60 to-transparent' />
                            <div className='absolute bottom-0 left-0 p-4 flex items-end gap-3'>
                                <img
                                    src={movie.poster_url}
                                    alt={movie.title}
                                    className='w-12 h-16 object-cover rounded-lg border border-cinema-border flex-shrink-0'
                                />
                                <div>
                                    <h2 className='font-semibold text-base leading-tight'>{movie.title}</h2>
                                    <p className='text-cinema-muted text-xs mt-0.5'>
                                        {movie.language} · {movie.duration_mins} mins
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!movie?.poster_url && (
                        <div className='px-5 pt-5'>
                            <h2 className='font-semibold text-lg'>{movie?.title ?? "Movie"}</h2>
                            <p className='text-cinema-muted text-sm'>
                                {movie?.language} · {movie?.duration_mins} mins
                            </p>
                        </div>
                    )}

                    {/* showtime details grid */}
                    <div className='p-5 grid grid-cols-2 gap-4 text-sm'>
                        <div>
                            <p className='text-cinema-muted text-xs uppercase tracking-wide mb-1'>Date</p>
                            <p className='font-medium'>{showtime?.starts_at ? formatDate(showtime.starts_at) : "—"}</p>
                        </div>
                        <div>
                            <p className='text-cinema-muted text-xs uppercase tracking-wide mb-1'>Time</p>
                            <p className='font-medium'>{showtime?.starts_at ? formatTime(showtime.starts_at) : "—"}</p>
                        </div>
                        <div>
                            <p className='text-cinema-muted text-xs uppercase tracking-wide mb-1'>Theatre</p>
                            <p className='font-medium'>{theatre?.name ?? "—"}</p>
                            <p className='text-cinema-muted text-xs'>{theatre?.city}</p>
                        </div>
                        <div>
                            <p className='text-cinema-muted text-xs uppercase tracking-wide mb-1'>Hall</p>
                            <p className='font-medium'>{hall?.name ?? "—"}</p>
                        </div>
                    </div>
                </div>

                {/* ── seats ────────────────────────────────────────── */}
                {booking.seats && booking.seats.length > 0 && (
                    <div className='bg-cinema-card border border-cinema-border rounded-xl overflow-hidden'>
                        <div className='px-5 py-4 border-b border-cinema-border flex items-center justify-between'>
                            <h3 className='font-medium'>
                                {booking.seats.length} Seat{booking.seats.length !== 1 ? "s" : ""}
                            </h3>
                        </div>
                        {booking.seats.map((seat, i) => (
                            <div
                                key={i}
                                className='flex items-center justify-between px-5 py-3
                           border-b border-cinema-border last:border-0'>
                                <div className='flex items-center gap-3'>
                                    <span className='font-mono font-medium text-sm'>
                                        {seat.row_label}
                                        {seat.col_number}
                                    </span>
                                    <span
                                        className='text-xs px-2 py-0.5 rounded-full bg-cinema-surface
                                   text-cinema-muted capitalize border border-cinema-border'>
                                        {seat.seat_type}
                                    </span>
                                </div>
                                <span className='text-sm'>₹{seat.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── price breakdown ───────────────────────────────── */}
                <div className='bg-cinema-card border border-cinema-border rounded-xl overflow-hidden'>
                    <div className='px-5 py-4 border-b border-cinema-border'>
                        <h3 className='font-medium'>Price Breakdown</h3>
                    </div>
                    <div className='px-5 py-4 space-y-3 text-sm'>
                        <div className='flex justify-between'>
                            <span className='text-cinema-muted'>Subtotal</span>
                            <span>₹{subtotal?.toFixed(2)}</span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-cinema-muted'>Convenience fee (2%)</span>
                            <span>₹{convenience_fee?.toFixed(2)}</span>
                        </div>
                        <div className='flex justify-between'>
                            <span className='text-cinema-muted'>GST (18%)</span>
                            <span>₹{taxes?.toFixed(2)}</span>
                        </div>
                        <div className='border-t border-cinema-border pt-3 flex justify-between font-semibold text-base'>
                            <span>Total paid</span>
                            <span>₹{booking.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* ── QR code ──────────────────────────────────────── */}
                {booking.qr_code_url && booking.status === "confirmed" && (
                    <div className='bg-cinema-card border border-cinema-border rounded-xl p-5 text-center space-y-3'>
                        <h3 className='font-medium'>Your Ticket</h3>
                        <p className='text-cinema-muted text-sm'>Show this at the theatre entrance</p>
                        <div className='flex justify-center'>
                            <img
                                src={booking.qr_code_url}
                                alt='Ticket QR Code'
                                className='w-52 h-52 rounded-xl border border-cinema-border'
                            />
                        </div>

                        <a
                            href={booking.qr_code_url}
                            download={`ticket-${booking.id}.png`}
                            className='inline-flex items-center gap-2 px-4 py-2 border border-cinema-border
                         rounded-lg text-sm hover:bg-cinema-surface transition-colors'>
                            ↓ Download ticket
                        </a>
                    </div>
                )}

                {/* ── booking meta ──────────────────────────────────── */}
                <div className='bg-cinema-card border border-cinema-border rounded-xl px-5 py-4 space-y-2 text-sm'>
                    <div className='flex justify-between'>
                        <span className='text-cinema-muted'>Booking ID</span>
                        <span className='font-mono text-xs text-cinema-muted'>{booking.id}</span>
                    </div>
                    <div className='flex justify-between'>
                        <span className='text-cinema-muted'>Booked on</span>
                        <span>{formatDateTime(booking.created_at)}</span>
                    </div>
                    {booking.confirmed_at && (
                        <div className='flex justify-between'>
                            <span className='text-cinema-muted'>Confirmed at</span>
                            <span>{formatDateTime(booking.confirmed_at)}</span>
                        </div>
                    )}
                </div>

                {/* ── cancel button ─────────────────────────────────── */}
                {isCancellable() && (
                    <button
                        onClick={() => setShowCancelDialog(true)}
                        className='w-full py-3 border border-red-800 text-red-400 rounded-xl
                       hover:bg-red-950 transition-colors text-sm font-medium'>
                        Cancel booking
                    </button>
                )}

                {booking.status === "cancelled" && (
                    <div className='px-4 py-3 bg-red-950 border border-red-800 rounded-xl text-center'>
                        <p className='text-red-400 text-sm font-medium'>This booking has been cancelled</p>
                        <p className='text-red-500 text-xs mt-1'>Refund will be credited within 5 business days</p>
                    </div>
                )}
            </div>

            {/* ── cancel confirmation dialog ─────────────────────── */}
            {showCancelDialog && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70'>
                    <div className='bg-cinema-card border border-cinema-border rounded-2xl p-6 max-w-sm w-full space-y-4'>
                        <h3 className='font-semibold text-lg'>Cancel booking?</h3>
                        <p className='text-cinema-muted text-sm leading-relaxed'>
                            Are you sure you want to cancel your booking for{" "}
                            <span className='text-white font-medium'>{movie?.title}</span>? You'll receive a full refund
                            within 5 business days.
                        </p>

                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder='Reason for cancellation (optional)'
                            maxLength={500}
                            rows={3}
                            className='w-full bg-cinema-surface border border-cinema-border rounded-lg
                                px-3 py-2.5 text-sm text-white placeholder:text-cinema-muted
                                resize-none focus:outline-none focus:border-gray-500 transition-colors'
                        />
                        <p className='text-right text-xs text-cinema-muted'>{cancelReason.length}/500</p>

                        {cancelError && (
                            <p className='text-red-400 text-sm px-3 py-2 bg-red-950 border border-red-800 rounded-lg'>
                                {cancelError}
                            </p>
                        )}

                        <div className='flex gap-3 pt-1'>
                            <button
                                onClick={() => {
                                    setShowCancelDialog(false);
                                    setCancelError(null);
                                }}
                                disabled={isCancelling}
                                className='flex-1 py-2.5 border border-cinema-border rounded-xl text-sm
                           hover:bg-cinema-surface transition-colors disabled:opacity-50'>
                                Keep booking
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className='flex-1 py-2.5 bg-red-700 hover:bg-red-600 rounded-xl text-sm
                           font-medium transition-colors disabled:opacity-50'>
                                {isCancelling ? "Cancelling..." : "Yes, cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
