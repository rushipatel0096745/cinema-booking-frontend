import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSeatStore } from "../store/seatStore";
import { useBookingStore } from "../store/bookingStore";
import { useSeatMap } from "../hook/useSeatmap";
import { lockSeats } from "../api/bookings";
import { getShowtime } from "../api/showtime";
import SeatCell from "../components/SeatCell";
import type { SeatCell as SeatCellType, Movie, Showtime } from "../types";
import { ArrowLeft, Film, MapPin, Calendar, Clock, Info } from "lucide-react";

export default function SeatPicker() {
    const { showtimeId } = useParams<{ showtimeId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Seat state from store
    const { seatMap, selectedIds, toggleSeat, clearSelection } = useSeatStore();
    const { setLock } = useBookingStore();

    // Fetch and bind seat map to Zustand + WebSockets
    const seatMapQuery = useSeatMap(showtimeId ?? "");

    // Showtime details state (fallback for direct refresh)
    const [movie, setMovie] = useState<Movie | null>(location.state?.movie || null);
    const [showtime, setShowtime] = useState<Showtime | null>(location.state?.showtime || null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [isLocking, setIsLocking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Clear selection only on true first mount (empty deps intentional)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { clearSelection(); }, []);

    // Fetch showtime details if missing from routing state (e.g. reload)
    useEffect(() => {
        if (!showtime && showtimeId) {
            setDetailsLoading(true);
            getShowtime(showtimeId)
                .then((data) => {
                    setShowtime(data);
                    if (data.movie) {
                        setMovie(data.movie);
                    }
                })
                .catch((err) => {
                    console.error("Failed to load showtime details", err);
                    setError("Failed to load showtime details. Please try again.");
                })
                .finally(() => {
                    setDetailsLoading(false);
                });
        }
    }, [showtimeId, showtime]);

    // Calculate total price of selected seats
    const selectedSeats = seatMap?.rows.flatMap((r) => r.seats.filter((s) => selectedIds.has(s.id))) ?? [];
    const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

    const handleProceedToCheckout = async () => {
        if (!showtimeId || selectedIds.size === 0) return;
        setIsLocking(true);
        setError(null);

        try {
            const res = await lockSeats(showtimeId, Array.from(selectedIds));
            setLock(res.seat_ids, res.lock_expires_at, res.total_amount);
            // Pass locked seats directly via state so Checkout doesn't depend on
            // Zustand selectedIds timing (which can be wiped before Checkout mounts)
            navigate(`/checkout/${showtimeId}`, {
                state: { movie, showtime, lockedSeats: selectedSeats },
            });
        } catch (err: any) {
            const errMsg = err?.response?.data?.error ?? "Failed to lock seats. Some seats might have just been taken!";
            setError(errMsg);
        } finally {
            setIsLocking(false);
        }
    };

    const formatTime = (iso: string) => {
        try {
            return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
        } catch {
            return iso;
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
        } catch {
            return iso;
        }
    };

    const handleBack = () => {
        if (movie?.id) {
            navigate(`/movies/${movie.id}`);
        } else {
            navigate("/dashboard");
        }
    };

    const isLoading = seatMapQuery.isLoading || detailsLoading;

    if (isLoading) {
        return (
            <div className='min-h-screen bg-cinema-bg text-white flex flex-col justify-center items-center gap-4'>
                <div className='h-12 w-12 rounded-full border-4 border-t-cinema-accent border-cinema-border animate-spin' />
                <span className='text-sm text-cinema-muted font-medium animate-pulse'>
                    Loading layout and live seating availability...
                </span>
            </div>
        );
    }

    if (seatMapQuery.isError || !seatMap) {
        return (
            <div className='min-h-screen bg-cinema-bg text-white flex flex-col items-center justify-center p-6 text-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-cinema-card border border-cinema-border/40 text-cinema-accent mb-6 shadow-inner'>
                    <Film size={28} />
                </div>
                <h3 className='text-xl font-bold text-white tracking-tight'>Failed to Load Seating</h3>
                <p className='mt-2 max-w-sm text-sm text-cinema-muted'>
                    {error || "Could not retrieve seat configuration for this showtime."}
                </p>
                <button
                    onClick={handleBack}
                    className='mt-6 rounded-xl bg-cinema-accent px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-600 transition-all flex items-center gap-2 cursor-pointer'>
                    <ArrowLeft size={14} /> Back to Movie details
                </button>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-cinema-bg text-white font-sans flex flex-col'>
            {/* STICKY TOP BAR */}
            <header className='sticky top-0 z-40 border-b border-cinema-border/40 bg-cinema-surface/90 backdrop-blur-xl py-3.5 shadow-md'>
                <div className='mx-auto max-w-7xl px-4 flex items-center gap-4'>
                    <button
                        onClick={handleBack}
                        className='p-2 rounded-xl bg-cinema-card/50 hover:bg-cinema-card border border-cinema-border/40 text-cinema-muted hover:text-white transition-all cursor-pointer'>
                        <ArrowLeft size={18} />
                    </button>
                    <div className='min-w-0'>
                        <h1 className='text-base md:text-lg font-bold tracking-tight text-white truncate'>
                            {movie?.title || "Choose Seats"}
                        </h1>
                        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cinema-muted mt-0.5'>
                            {showtime && (
                                <>
                                    <span className='flex items-center gap-1'>
                                        <MapPin size={12} className='text-cinema-accent' />
                                        {showtime.theatre?.name} · {showtime.hall?.name}
                                    </span>
                                    <span className='hidden md:inline'>•</span>
                                    <span className='flex items-center gap-1'>
                                        <Calendar size={12} className='text-cinema-accent' />
                                        {formatDate(showtime.starts_at)}
                                    </span>
                                    <span>•</span>
                                    <span className='flex items-center gap-1'>
                                        <Clock size={12} className='text-cinema-accent' />
                                        {formatTime(showtime.starts_at)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className='flex-1 mx-auto max-w-7xl w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8'>
                {/* SEAT GRID SECTION */}
                <div className='lg:col-span-2 bg-cinema-surface/30 border border-cinema-border/40 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[450px]'>
                    {/* Screen Visual */}
                    <div className='w-full max-w-lg flex flex-col items-center mb-10'>
                        <div className='w-full h-1.5 bg-gradient-to-r from-transparent via-cinema-accent to-transparent rounded-full shadow-[0_4px_20px_rgba(229,9,20,0.5)] mb-2' />
                        <span className='text-[10px] font-bold text-cinema-muted uppercase tracking-[0.3em]'>SCREEN THIS WAY</span>
                    </div>

                    {/* Interactive Seat Layout Grid */}
                    <div className='w-full overflow-x-auto flex justify-center pb-6 scrollbar-thin'>
                        <div className='flex flex-col gap-2.5 items-center min-w-max px-4'>
                            {seatMap.rows.map((row) => (
                                <div key={row.label} className='flex gap-2 items-center'>
                                    {/* Left Row Label */}
                                    <span className='text-cinema-muted text-xs font-bold w-5 text-right flex-shrink-0 select-none'>
                                        {row.label}
                                    </span>

                                    {/* Seats list */}
                                    <div className='flex gap-1.5'>
                                        {row.seats.map((seat) => (
                                            <SeatCell
                                                key={seat.is_aisle ? `aisle-${seat.col}` : seat.id}
                                                seat={seat}
                                                isSelected={selectedIds.has(seat.id)}
                                                onToggle={(id, status) => toggleSeat(id, status as SeatCellType["status"])}
                                            />
                                        ))}
                                    </div>

                                    {/* Right Row Label */}
                                    <span className='text-cinema-muted text-xs font-bold w-5 text-left flex-shrink-0 select-none'>
                                        {row.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SEATING LEGEND */}
                    <div className='border-t border-cinema-border/40 w-full pt-6 mt-4 flex flex-col gap-4 items-center'>
                        {/* Status Legend */}
                        <div className='flex flex-wrap gap-x-6 gap-y-3 justify-center'>
                            {[
                                { label: "Available", className: "bg-cinema-card border border-cinema-border" },
                                { label: "Selected", className: "bg-emerald-700 border border-emerald-400" },
                                { label: "Locked", className: "bg-amber-950 border border-amber-700 opacity-70" },
                                { label: "Booked", className: "bg-gray-900 border border-gray-700 opacity-40" },
                            ].map(({ label, className }) => (
                                <div key={label} className='flex items-center gap-2'>
                                    <div className={`w-4 h-4 rounded-sm ${className}`} />
                                    <span className='text-cinema-muted text-xs font-semibold'>{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Pricing Category Legend */}
                        <div className='flex flex-wrap gap-x-6 gap-y-2 justify-center text-xs text-cinema-muted font-medium bg-cinema-card/40 border border-cinema-border/20 px-4 py-2 rounded-xl'>
                            <div>
                                <span className='text-white font-bold'>Standard:</span> Base price
                            </div>
                            <div className='hidden sm:block text-cinema-border'>|</div>
                            <div>
                                <span className='text-white font-bold'>Premium:</span> 1.5× price
                            </div>
                            <div className='hidden sm:block text-cinema-border'>|</div>
                            <div>
                                <span className='text-white font-bold'>Recliner:</span> 2.0× price
                            </div>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR SUMMARY SECTION */}
                <div className='lg:col-span-1 flex flex-col gap-4'>
                    {error && (
                        <div className='p-4 bg-red-950/70 border border-red-800 rounded-2xl text-red-300 text-sm flex items-start gap-2.5 shadow-lg'>
                            <Info size={18} className='flex-shrink-0 mt-0.5 text-red-400' />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className='bg-cinema-card border border-cinema-border/50 rounded-2xl p-5 space-y-5 shadow-lg flex-1 flex flex-col justify-between'>
                        <div className='space-y-4'>
                            <h3 className='text-base font-extrabold text-white tracking-wide border-b border-cinema-border pb-3'>
                                Ticket Summary
                            </h3>

                            {selectedSeats.length === 0 ? (
                                <div className='py-12 text-center space-y-3'>
                                    <div className='w-12 h-12 rounded-full bg-cinema-surface border border-cinema-border flex items-center justify-center mx-auto text-cinema-muted'>
                                        <Info size={20} />
                                    </div>
                                    <p className='text-sm text-cinema-muted max-w-[200px] mx-auto leading-relaxed'>
                                        Please select seats from the grid to proceed with your booking.
                                    </p>
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    {/* Selected Seats Badges */}
                                    <div className='flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1'>
                                        {selectedSeats.map((seat) => (
                                            <div
                                                key={seat.id}
                                                className='px-3 py-1.5 bg-cinema-surface border border-cinema-border rounded-xl flex items-center justify-between text-xs w-full'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='font-bold text-white'>Col {seat.col}</span>
                                                    <span className='px-1.5 py-0.5 rounded bg-cinema-card text-[10px] text-cinema-muted capitalize'>
                                                        {seat.type}
                                                    </span>
                                                </div>
                                                <span className='font-bold text-emerald-400'>₹{seat.price.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Cost breakdown */}
                                    <div className='bg-cinema-surface/50 rounded-xl p-3.5 border border-cinema-border/20 space-y-2.5'>
                                        <div className='flex justify-between text-xs text-cinema-muted font-medium'>
                                            <span>Selected Seats ({selectedSeats.length})</span>
                                            <span>₹{totalPrice.toFixed(2)}</span>
                                        </div>
                                        <div className='flex justify-between text-xs text-cinema-muted font-medium'>
                                            <span>Booking Fees</span>
                                            <span className='text-emerald-500'>Calculated next</span>
                                        </div>
                                        <div className='border-t border-cinema-border/40 pt-2.5 flex justify-between items-center'>
                                            <span className='text-xs font-bold text-white uppercase'>Estimated Subtotal</span>
                                            <span className='text-lg font-black text-white'>₹{totalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Hold Timer Warning */}
                                    <div className='flex items-start gap-2 text-[11px] text-cinema-gold bg-cinema-gold/5 border border-cinema-gold/20 p-3 rounded-xl leading-relaxed'>
                                        <Info size={14} className='flex-shrink-0 mt-0.5' />
                                        <span>
                                            Seats will be locked for <strong>5 minutes</strong> to complete the payment after you
                                            click proceed.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Booking action button */}
                        <div className='pt-4'>
                            <button
                                onClick={handleProceedToCheckout}
                                disabled={selectedIds.size === 0 || isLocking}
                                className='w-full py-4 bg-cinema-accent hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-base tracking-wide transition-all shadow-lg shadow-cinema-accent/15 cursor-pointer flex items-center justify-center gap-2'>
                                {isLocking ? (
                                    <>
                                        <div className='h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin' />
                                        Locking Seating...
                                    </>
                                ) : (
                                    `Proceed to Book (₹${totalPrice.toFixed(2)})`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}