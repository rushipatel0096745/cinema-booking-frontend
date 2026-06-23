// src/pages/MyTickets.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserBookings } from "../api/bookings";
import type { Booking } from "../types";

type StatusTab = "upcoming" | "past" | "cancelled" | "refunded";

const tabs: { label: string; value: StatusTab }[] = [
    { label: "Upcoming", value: "upcoming" },
    { label: "Past", value: "past" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Refunded", value: "refunded" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
    confirmed: { label: "Confirmed", className: "bg-emerald-900 text-emerald-400 border-emerald-700" },
    cancelled: { label: "Cancelled", className: "bg-red-900    text-red-400    border-red-700" },
    refunded: { label: "Refunded", className: "bg-gray-800   text-gray-400   border-gray-600" },
};

// ── derives the correct API params from the active tab ───────
function getQueryParams(tab: StatusTab): { status?: string; upcoming?: boolean } {
    switch (tab) {
        case "upcoming":
            return { status: "confirmed", upcoming: true };
        case "past":
            return { status: "confirmed", upcoming: false };
        case "cancelled":
            return { status: "cancelled" };
        case "refunded":
            return { status: "refunded" };
    }
}

// ── filters bookings client-side by starts_at ────────────────
// upcoming = starts_at in the future, past = starts_at in the past
function filterByTime(bookings: Booking[], tab: StatusTab): Booking[] {
    if (tab !== "upcoming" && tab !== "past") return bookings;
    const now = new Date();
    return bookings.filter((b) => {
        if (!b.showtime?.starts_at) return false;
        const startsAt = new Date(b.showtime.starts_at);
        return tab === "upcoming" ? startsAt > now : startsAt <= now;
    });
}

// ── empty state messages ──────────────────────────────────────
const emptyMessages: Record<StatusTab, { icon: string; title: string; desc: string }> = {
    upcoming: { icon: "🎬", title: "No upcoming shows", desc: "Your confirmed upcoming bookings will appear here." },
    past: { icon: "🎞️", title: "No past shows", desc: "Movies you have already watched will appear here." },
    cancelled: { icon: "✕", title: "No cancelled tickets", desc: "Bookings you have cancelled will appear here." },
    refunded: { icon: "↩", title: "No refunds", desc: "Refunded bookings will appear here once processed." },
};

// ── Booking card ──────────────────────────────────────────────
function BookingCard({ booking, tab }: { booking: Booking; tab: StatusTab }) {
    const navigate = useNavigate();
    const movie = booking.showtime?.movie;
    const theatre = booking.showtime?.theatre;
    const showtime = booking.showtime;
    const status = statusConfig[booking.status] ?? statusConfig.confirmed;

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    // days until show — shown on upcoming cards
    const daysUntil = showtime?.starts_at
        ? Math.ceil((new Date(showtime.starts_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

    return (
        <button
            onClick={() => navigate(`/bookings/${booking.id}`)}
            className='w-full text-left bg-cinema-card border border-cinema-border rounded-xl
                 overflow-hidden hover:border-gray-600 transition-all duration-150 group'>
            <div className='flex'>
                {/* poster */}
                <div className='w-20 shrink-0 relative overflow-hidden min-h-28'>
                    {movie?.poster_url ? (
                        <img
                            src={movie.poster_url}
                            alt={movie.title}
                            className={`w-full h-full object-cover transition-transform duration-300
                group-hover:scale-105
                ${tab === "past" || tab === "cancelled" ? "opacity-50 grayscale" : ""}`}
                        />
                    ) : (
                        <div className='w-full h-full bg-cinema-surface flex items-center justify-center'>
                            <span className='text-cinema-muted text-2xl'>🎬</span>
                        </div>
                    )}

                    {/* upcoming badge */}
                    {tab === "upcoming" && daysUntil !== null && (
                        <div className='absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-center'>
                            <span className='text-[9px] font-medium text-white'>
                                {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow" : `${daysUntil}d away`}
                            </span>
                        </div>
                    )}

                    {/* refunded overlay */}
                    {tab === "refunded" && (
                        <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                            <span className='text-xs font-medium text-gray-300 rotate-[-20deg]'>Refunded</span>
                        </div>
                    )}
                </div>

                {/* content */}
                <div className='flex-1 p-4 min-w-0'>
                    <div className='flex items-start justify-between gap-2 mb-1.5'>
                        <h3 className='font-semibold text-sm leading-tight line-clamp-2 flex-1'>
                            {movie?.title ?? "Movie"}
                        </h3>
                        <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${status.className}`}>
                            {status.label}
                        </span>
                    </div>

                    <p className='text-cinema-muted text-xs truncate mb-2'>
                        {theatre?.name}
                        {theatre?.city ? ` · ${theatre.city}` : ""}
                    </p>

                    {showtime?.starts_at && (
                        <p className={`text-xs mb-2.5 ${tab === "upcoming" ? "text-emerald-400" : "text-white/70"}`}>
                            {formatDate(showtime.starts_at)} · {formatTime(showtime.starts_at)}
                        </p>
                    )}

                    <div className='flex items-center justify-between gap-2'>
                        {/* seat badges */}
                        {booking.seats && booking.seats.length > 0 ? (
                            <div className='flex items-center gap-1 flex-wrap'>
                                {booking.seats.slice(0, 4).map((seat, i) => (
                                    <span
                                        key={i}
                                        className='text-[10px] px-1.5 py-0.5 bg-cinema-surface border
                               border-cinema-border rounded font-mono text-cinema-muted'>
                                        {seat.row_label}
                                        {seat.col_number}
                                    </span>
                                ))}
                                {booking.seats.length > 4 && (
                                    <span className='text-[10px] text-cinema-muted'>+{booking.seats.length - 4}</span>
                                )}
                            </div>
                        ) : (
                            <span />
                        )}
                        <span className='text-sm font-semibold flex-shrink-0'>₹{booking.total_amount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* upcoming — QR hint strip */}
            {tab === "upcoming" && booking.qr_code_url && (
                <div
                    className='border-t border-cinema-border px-4 py-2 flex items-center gap-2
                        bg-cinema-surface/50'>
                    <span className='text-[10px] text-cinema-muted'>Tap to view QR ticket</span>
                    <span className='ml-auto text-cinema-muted text-xs'>→</span>
                </div>
            )}

            {/* refunded — refund notice strip */}
            {tab === "refunded" && (
                <div className='border-t border-cinema-border px-4 py-2 bg-gray-900/50'>
                    <p className='text-[11px] text-gray-400'>
                        Refund of ₹{booking.total_amount.toFixed(2)} · within 5 business days
                    </p>
                </div>
            )}
        </button>
    );
}

// ── Main page ─────────────────────────────────────────────────
export default function MyTickets() {
    const [activeTab, setActiveTab] = useState<StatusTab>("upcoming");
    const [page, setPage] = useState(1);

    const params = getQueryParams(activeTab);

    const { data, isLoading, error } = useQuery({
        queryKey: ["bookings", activeTab, page],
        queryFn: () => getUserBookings(params.status, page, 10),
    });

    // upcoming/past split happens client-side since both use status=confirmed
    const allBookings = data?.data ?? [];
    const bookings = filterByTime(allBookings, activeTab);
    const meta = data?.meta;
    const empty = emptyMessages[activeTab];

    const handleTabChange = (tab: StatusTab) => {
        setActiveTab(tab);
        setPage(1);
    };

    return (
        <div className='min-h-screen bg-cinema-bg text-white'>
            {/* header */}
            <div className='sticky top-0 z-10 bg-cinema-surface border-b border-cinema-border'>
                <div className='max-w-lg mx-auto px-4 pt-4'>
                    <h1 className='text-xl font-semibold mb-4'>My Tickets</h1>

                    {/* tabs */}
                    <div className='flex'>
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => handleTabChange(tab.value)}
                                className={`flex-1 py-2.5 text-xs font-medium border-b-2 transition-colors
                  ${
                      activeTab === tab.value
                          ? "border-cinema-accent text-white"
                          : "border-transparent text-cinema-muted hover:text-white"
                  }`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className='max-w-lg mx-auto px-4 py-5 space-y-3'>
                {/* loading */}
                {isLoading && (
                    <div className='flex items-center justify-center py-20'>
                        <div className='w-8 h-8 border-2 border-cinema-accent border-t-transparent rounded-full animate-spin' />
                    </div>
                )}

                {/* error */}
                {error && (
                    <div
                        className='px-4 py-3 bg-red-950 border border-red-800 rounded-xl
                          text-red-300 text-sm text-center'>
                        Failed to load bookings. Please try again.
                    </div>
                )}

                {/* empty state */}
                {!isLoading && !error && bookings.length === 0 && (
                    <div className='flex flex-col items-center justify-center py-20 space-y-3 text-center px-8'>
                        <span className='text-5xl'>{empty.icon}</span>
                        <p className='font-medium text-white'>{empty.title}</p>
                        <p className='text-cinema-muted text-sm leading-relaxed'>{empty.desc}</p>
                        {activeTab === "upcoming" && (
                            <button
                                onClick={() => (window.location.href = "/")}
                                className='mt-2 px-5 py-2.5 bg-cinema-accent hover:bg-red-700
                           rounded-lg text-sm font-medium transition-colors'>
                                Browse movies
                            </button>
                        )}
                    </div>
                )}

                {/* cards */}
                {!isLoading &&
                    bookings.map((booking) => <BookingCard key={booking.id} booking={booking} tab={activeTab} />)}

                {/* pagination */}
                {!isLoading && meta && meta.total_pages > 1 && (
                    <div className='flex items-center justify-between pt-2'>
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className='px-4 py-2 border border-cinema-border rounded-lg text-sm
                         disabled:opacity-40 disabled:cursor-not-allowed
                         hover:bg-cinema-surface transition-colors'>
                            ← Previous
                        </button>
                        <span className='text-cinema-muted text-sm'>
                            {meta.page} / {meta.total_pages}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
                            disabled={page === meta.total_pages}
                            className='px-4 py-2 border border-cinema-border rounded-lg text-sm
                         disabled:opacity-40 disabled:cursor-not-allowed
                         hover:bg-cinema-surface transition-colors'>
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
