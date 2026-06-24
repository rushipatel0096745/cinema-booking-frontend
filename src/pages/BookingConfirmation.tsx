import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useBookingStatus } from "../hook/useBookingStatus";
import { useSeatStore } from "../store/seatStore";
import { useBookingStore } from "../store/bookingStore";

export default function BookingConfirmation() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const clearSelection = useSeatStore((s) => s.clearSelection);
    const clearBooking = useBookingStore((s) => s.clearBooking);

    // show timeout message if still pending after a while
    const [timedOut, setTimedOut] = useState(false);

    const { data: booking, isLoading } = useBookingStatus(bookingId ?? null);

    // clear seat selection and booking secret once confirmed
    useEffect(() => {
        if (booking?.status === "confirmed") {
            clearSelection();
            clearBooking();
        }
    }, [booking?.status, clearSelection, clearBooking]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (booking?.status === "pending") {
                setTimedOut(true);
            }
        }, 35000); // 35 seconds

        return () => clearTimeout(timer);
    }, [booking?.status]);

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

    if (timedOut && booking?.status === "pending") {
        return (
            <div className='min-h-screen bg-cinema-bg text-white flex items-center justify-center px-4'>
                <div className='text-center space-y-4 max-w-sm'>
                    <p className='text-4xl'>⏱</p>
                    <h1 className='text-xl font-semibold'>Payment is being processed</h1>
                    <p className='text-cinema-muted text-sm leading-relaxed'>
                        Your payment was received but confirmation is taking longer than usual. Check your email or
                        visit My Tickets in a few minutes.
                    </p>
                    <button
                        onClick={() => navigate("/my-tickets")}
                        className='px-6 py-3 bg-cinema-accent hover:bg-red-700 rounded-lg font-medium transition-colors'>
                        Go to My Tickets
                    </button>
                </div>
            </div>
        );
    }

    // pending — show loading while webhook fires
    if (isLoading || booking?.status === "pending") {
        return (
            <div className='min-h-screen bg-cinema-bg text-white flex items-center justify-center'>
                <div className='text-center space-y-4'>
                    <div className='w-12 h-12 border-2 border-cinema-accent border-t-transparent rounded-full animate-spin mx-auto' />
                    <p className='text-cinema-muted text-sm'>Confirming your booking...</p>
                    <p className='text-cinema-muted text-xs'>This usually takes a few seconds</p>
                </div>
            </div>
        );
    }

    // failed
    if (!booking || booking.status === "cancelled") {
        return (
            <div className='min-h-screen bg-cinema-bg text-white flex items-center justify-center px-4'>
                <div className='text-center space-y-4 max-w-sm'>
                    <div className='text-5xl'>✕</div>
                    <h1 className='text-xl font-semibold'>Payment unsuccessful</h1>
                    <p className='text-cinema-muted text-sm'>
                        Your seats have been released. Please try booking again.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className='px-6 py-3 bg-cinema-accent hover:bg-red-700 rounded-lg font-medium transition-colors'>
                        Browse movies
                    </button>
                </div>
            </div>
        );
    }

    // confirmed
    const showtime = booking.showtime;
    const movie = showtime?.movie;
    const theatre = showtime?.theatre;
    const hall = showtime?.hall;

    return (
        <div className='min-h-screen bg-cinema-bg text-white'>
            <div className='max-w-lg mx-auto px-4 py-8 space-y-5'>
                {/* success header */}
                <div className='text-center space-y-2 py-4'>
                    <div className='w-14 h-14 bg-emerald-900 rounded-full flex items-center justify-center mx-auto text-2xl'>
                        ✓
                    </div>
                    <h1 className='text-2xl font-semibold'>Booking confirmed!</h1>
                    <p className='text-cinema-muted text-sm'>A confirmation email has been sent to you.</p>
                </div>

                {/* movie + showtime */}
                <div className='bg-cinema-card border border-cinema-border rounded-xl overflow-hidden'>
                    {movie?.poster_url && (
                        <div className='relative h-32 overflow-hidden'>
                            <img
                                src={movie.poster_url}
                                alt={movie.title}
                                className='w-full h-full object-cover opacity-40'
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-cinema-card to-transparent' />
                        </div>
                    )}
                    <div className='p-5 space-y-4'>
                        <div>
                            <h2 className='text-xl font-semibold'>{movie?.title}</h2>
                            <p className='text-cinema-muted text-sm mt-1'>
                                {movie?.language} · {movie?.duration_mins} mins
                            </p>
                        </div>
                        <div className='grid grid-cols-2 gap-4 text-sm'>
                            <div>
                                <p className='text-cinema-muted text-xs uppercase tracking-wide mb-1'>Date</p>
                                <p>{showtime ? formatDate(showtime.starts_at) : "—"}</p>
                            </div>
                            <div>
                                <p className='text-cinema-muted text-xs uppercase tracking-wide mb-1'>Time</p>
                                <p>{showtime ? formatTime(showtime.starts_at) : "—"}</p>
                            </div>
                            <div>
                                <p className='text-cinema-muted text-xs uppercase tracking-wide mb-1'>Theatre</p>
                                <p>{theatre?.name ?? "—"}</p>
                                <p className='text-cinema-muted text-xs'>{theatre?.city}</p>
                            </div>
                            <div>
                                <p className='text-cinema-muted text-xs uppercase tracking-wide mb-1'>Hall</p>
                                <p>{hall?.name ?? "—"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* seats */}
                {booking.seats && booking.seats.length > 0 && (
                    <div className='bg-cinema-card border border-cinema-border rounded-xl overflow-hidden'>
                        <div className='px-5 py-4 border-b border-cinema-border'>
                            <h3 className='font-medium'>
                                {booking.seats.length} Seat{booking.seats.length !== 1 ? "s" : ""}
                            </h3>
                        </div>
                        {booking.seats.map((seat, i) => (
                            <div
                                key={i}
                                className='flex justify-between items-center px-5 py-3 border-b border-cinema-border last:border-0 text-sm'>
                                <div className='flex items-center gap-3'>
                                    <span className='font-medium'>
                                        {seat.row_label}
                                        {seat.col_number}
                                    </span>
                                    <span className='text-xs px-2 py-0.5 rounded-full bg-cinema-surface text-cinema-muted capitalize'>
                                        {seat.seat_type}
                                    </span>
                                </div>
                                <span>₹{seat.price.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className='flex justify-between items-center px-5 py-4 font-semibold'>
                            <span>Total paid</span>
                            <span>₹{booking.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                {/* QR code */}
                {booking.qr_code_url && (
                    <div className='bg-cinema-card border border-cinema-border rounded-xl p-5 text-center space-y-3'>
                        <h3 className='font-medium'>Your ticket</h3>
                        <p className='text-cinema-muted text-sm'>Show this QR code at the theatre entrance</p>
                        <div className='flex justify-center'>
                            <img
                                src={booking.qr_code_url}
                                alt='Ticket QR Code'
                                className='w-48 h-48 rounded-xl border border-cinema-border'
                            />
                        </div>
                        <p className='text-cinema-muted text-xs font-mono'>{booking.id}</p>
                        <a
                            href={booking.qr_code_url}
                            download={`ticket-${booking.id}.png`}
                            className='inline-block px-4 py-2 border border-cinema-border rounded-lg text-sm
                         hover:bg-cinema-surface transition-colors'>
                            Download ticket
                        </a>
                    </div>
                )}

                {/* actions */}
                <div className='flex gap-3'>
                    <Link
                        to='/my-bookings'
                        className='flex-1 py-3 text-center border border-cinema-border rounded-xl
                       hover:bg-cinema-surface transition-colors text-sm font-medium'>
                        My tickets
                    </Link>
                    <Link
                        to='/'
                        className='flex-1 py-3 text-center bg-cinema-accent hover:bg-red-700
                       rounded-xl transition-colors text-sm font-medium'>
                        Browse more movies
                    </Link>
                </div>
            </div>
        </div>
    );
}
