import { useState, useEffect } from "react";
import { getMovieDetailsApi, getMovieShowtimesApi } from "../api/movieApi";
import type { Movie, TheatreShowtimes } from "../types";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, Clock, Calendar, MapPin, ArrowLeft, Play, Film, Ticket, SlidersHorizontal } from "lucide-react";

const MovieDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState<Movie | null>(null);
    const [theatres, setTheatres] = useState<TheatreShowtimes[]>([]);
    const [movieLoading, setMovieLoading] = useState(true);
    const [showtimesLoading, setShowtimesLoading] = useState(true);

    // Sync selected city with localStorage
    const [city, setCity] = useState(() => {
        return localStorage.getItem("selected-city") || "Ahmedabad";
    });

    const [selectedDate, setSelectedDate] = useState(() => {
        return new Date().toISOString().split("T")[0];
    });

    // Save city selection to localStorage
    const handleCityChange = (newCity: string) => {
        setCity(newCity);
        localStorage.setItem("selected-city", newCity);
    };

    const getNext7Days = () => {
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            return {
                weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
                dayNum: date.toLocaleDateString("en-US", { day: "numeric" }),
                month: date.toLocaleDateString("en-US", { month: "short" }),
                value: date.toISOString().split("T")[0],
            };
        });
    };

    const dates = getNext7Days();

    // Fetch movie details on mount / ID change
    useEffect(() => {
        async function fetchMovieDetails() {
            if (!id) return;
            try {
                setMovieLoading(true);
                const res = await getMovieDetailsApi(id);
                setMovie(res.movie);
            } catch (error) {
                console.error("Error fetching movie details:", error);
            } finally {
                setMovieLoading(false);
            }
        }
        fetchMovieDetails();
    }, [id]);

    // Fetch showtimes on ID, city, or date change
    useEffect(() => {
        async function fetchShowtimes() {
            if (!id) return;
            try {
                setShowtimesLoading(true);
                const res = await getMovieShowtimesApi(id, city, selectedDate);
                const cityData = res.cities?.find((c) => c.city.toLowerCase() === city.toLowerCase());
                setTheatres(cityData ? cityData.theatres : []);
            } catch (error) {
                console.error("Error fetching showtimes:", error);
                setTheatres([]);
            } finally {
                setShowtimesLoading(false);
            }
        }
        fetchShowtimes();
    }, [id, city, selectedDate]);

    const formatShowtime = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch {
            return dateStr;
        }
    };

    if (movieLoading) {
        return (
            <div className='min-h-screen bg-cinema-bg text-white flex flex-col justify-center items-center py-20 gap-4'>
                <div className='h-12 w-12 rounded-full border-4 border-t-cinema-accent border-cinema-border animate-spin' />
                <span className='text-sm text-cinema-muted font-medium animate-pulse'>
                    Loading cinematic details...
                </span>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className='min-h-screen bg-cinema-bg text-white flex flex-col items-center justify-center p-6 text-center'>
                <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-cinema-card border border-cinema-border/40 text-cinema-accent mb-6 shadow-inner'>
                    <Film size={28} />
                </div>
                <h3 className='text-xl font-bold text-white tracking-tight'>Movie Not Found</h3>
                <p className='mt-2 max-w-sm text-sm text-cinema-muted'>
                    The movie you are looking for does not exist or has been removed.
                </p>
                <Link
                    to='/dashboard'
                    className='mt-6 rounded-xl bg-cinema-accent px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-600 transition-all flex items-center gap-2'>
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-cinema-bg text-white font-sans selection:bg-cinema-accent/30 selection:text-cinema-accent pb-20'>
            {/* Cinematic Backdrop Hero */}
            <div className='relative w-full overflow-hidden border-b border-cinema-border/20 bg-black min-h-[50vh] flex items-end'>
                {/* Backdrop Image */}
                {movie.poster_url && (
                    <div className='absolute inset-0 z-0'>
                        <img
                            src={movie.poster_url}
                            alt=''
                            className='h-full w-full object-cover object-top opacity-25 blur-xl scale-110'
                        />
                        {/* Widescreen backdrop simulation gradient overlay */}
                        <div className='absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/80 to-transparent' />
                    </div>
                )}

                {/* Back Link */}
                <div className='absolute top-6 left-6 z-30'>
                    <Link
                        to='/dashboard'
                        className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/40 hover:bg-black/60 text-sm font-semibold border border-white/10 backdrop-blur transition-all duration-300 group'>
                        <ArrowLeft size={16} className='group-hover:-translate-x-1 transition-transform' />
                        Back to Movies
                    </Link>
                </div>

                {/* Main Hero Card Container */}
                <div className='mx-auto max-w-7xl w-full px-6 py-12 relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8 md:items-end'>
                    {/* Floating Side Poster */}
                    <div className='md:col-span-1 group aspect-[2/3] w-full rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/80 bg-cinema-card/50'>
                        {movie.poster_url ? (
                            <img
                                src={movie.poster_url}
                                alt={movie.title}
                                className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                            />
                        ) : (
                            <div className='flex h-full w-full flex-col items-center justify-center text-cinema-muted p-6'>
                                <Film size={40} className='stroke-1 mb-2' />
                                <span className='text-xs font-medium'>No Poster</span>
                            </div>
                        )}
                    </div>

                    {/* Movie Text Info */}
                    <div className='md:col-span-3 space-y-5'>
                        {/* Title and Rating */}
                        <div className='space-y-3'>
                            <div className='flex items-center gap-2.5 flex-wrap'>
                                <span className='text-[10px] font-bold text-cinema-accent bg-cinema-accent/10 border border-cinema-accent/20 px-2 py-0.5 rounded-md uppercase tracking-wider'>
                                    {movie.language}
                                </span>
                                {movie.genre &&
                                    movie.genre.map((genre) => (
                                        <span
                                            key={genre}
                                            className='rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-gray-300 tracking-wide'>
                                            {genre}
                                        </span>
                                    ))}
                            </div>
                            <h1 className='text-3xl md:text-5xl font-black tracking-tight text-white'>{movie.title}</h1>
                        </div>

                        {/* Rating, Duration & Release Date */}
                        <div className='flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-gray-300'>
                            <div className='flex items-center gap-1.5 text-cinema-gold'>
                                <Star size={16} fill='currentColor' />
                                <span>{movie.rating ? movie.rating.toFixed(1) : "N/A"} / 10</span>
                            </div>
                            <div className='flex items-center gap-1.5'>
                                <Clock size={16} className='text-cinema-accent' />
                                <span>{movie.duration_mins} mins</span>
                            </div>
                            <div className='flex items-center gap-1.5'>
                                <Calendar size={16} className='text-cinema-accent' />
                                <span>
                                    Released:{" "}
                                    {new Date(movie.release_date).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className='text-sm md:text-base leading-relaxed text-gray-300 max-w-3xl'>
                            {movie.description || "No description available for this show."}
                        </p>

                        {/* Trailer link */}
                        {movie.trailer_url && (
                            <a
                                href={movie.trailer_url}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='inline-flex items-center gap-2 rounded-xl bg-white text-cinema-bg hover:bg-white/95 px-5 py-3 font-bold text-sm shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer'>
                                <Play size={16} fill='currentColor' /> Watch Trailer
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Location & Date selection bar */}
            <div className='sticky top-0 z-40 border-b border-cinema-border/40 bg-cinema-surface/90 backdrop-blur-xl py-4 shadow-md'>
                <div className='mx-auto max-w-7xl px-6 flex flex-col md:flex-row gap-4 items-center justify-between'>
                    {/* Custom location dropdown */}
                    <div className='flex items-center gap-3 w-full md:w-auto justify-between md:justify-start'>
                        <span className='text-sm font-bold text-gray-300 flex items-center gap-1.5'>
                            <MapPin size={16} className='text-cinema-accent' /> City:
                        </span>
                        <div className='relative'>
                            <select
                                value={city}
                                onChange={(e) => handleCityChange(e.target.value)}
                                className='appearance-none rounded-xl border border-cinema-border/60 bg-cinema-card/70 py-2 pl-4 pr-10 text-sm font-bold text-white outline-none focus:border-cinema-accent/60 transition-all cursor-pointer min-w-[140px]'>
                                <option value='Ahmedabad'>Ahmedabad</option>
                                <option value='Mumbai'>Mumbai</option>
                                <option value='Surat'>Surat</option>
                                <option value='Vadodara'>Vadodara</option>
                            </select>
                            <div className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-cinema-muted'>
                                <SlidersHorizontal size={14} />
                            </div>
                        </div>
                    </div>

                    {/* Horizontal dates */}
                    <div className='flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0'>
                        {dates.map((date) => {
                            const isActive = selectedDate === date.value;
                            return (
                                <button
                                    key={date.value}
                                    onClick={() => setSelectedDate(date.value)}
                                    className={`flex items-center gap-2 whitespace-nowrap py-2 px-3.5 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
                                        isActive
                                            ? "bg-cinema-accent border-cinema-accent text-white shadow-md shadow-cinema-accent/15"
                                            : "bg-cinema-card/50 border-cinema-border/40 text-gray-300 hover:bg-cinema-card hover:border-cinema-border"
                                    }`}>
                                    <span>{date.weekday}</span>
                                    <span className='font-bold bg-white/10 px-1.5 py-0.5 rounded'>{date.dayNum}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Showtimes Selection Container */}
            <main className='mx-auto max-w-7xl px-6 py-10'>
                <div className='mb-6'>
                    <h2 className='text-2xl font-extrabold text-white flex items-center gap-2'>
                        <Ticket size={22} className='text-cinema-accent' /> Available Showtimes
                    </h2>
                    <p className='text-xs font-medium text-cinema-muted mt-1'>
                        Select a preferred slot to choose seats and book tickets.
                    </p>
                </div>

                {/* Loading state */}
                {showtimesLoading ? (
                    <div className='space-y-6'>
                        {[...Array(2)].map((_, i) => (
                            <div
                                key={i}
                                className='p-6 rounded-2xl border border-cinema-border/20 bg-cinema-card/10 animate-pulse space-y-4'>
                                <div className='h-5 bg-cinema-border/40 rounded w-1/4' />
                                <div className='h-4 bg-cinema-border/40 rounded w-1/3' />
                                <div className='flex gap-3 pt-2'>
                                    {[...Array(3)].map((_, j) => (
                                        <div key={j} className='h-10 bg-cinema-border/40 rounded-xl w-24' />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : theatres.length === 0 ? (
                    /* Empty state */
                    <div className='flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-cinema-border/20 bg-cinema-card/10 backdrop-blur-sm'>
                        <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-cinema-card border border-cinema-border/40 text-cinema-accent mb-4 shadow-inner'>
                            <Clock size={24} />
                        </div>
                        <h3 className='text-lg font-bold text-white tracking-tight'>No Shows Scheduled</h3>
                        <p className='mt-1.5 max-w-sm text-sm text-cinema-muted'>
                            There are no shows available for {movie.title} in {city} on this date.
                        </p>
                        <div className='mt-5 flex gap-3'>
                            <button
                                onClick={() => setSelectedDate(dates[0].value)}
                                className='rounded-xl bg-cinema-card hover:bg-cinema-border border border-cinema-border/60 px-4 py-2 text-xs font-semibold text-white transition-all'>
                                Reset Date to Today
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Theatres list and showtimes */
                    <div className='space-y-6'>
                        {theatres.map(({ theatre, showtimes }) => (
                            <div
                                key={theatre.id}
                                className='p-6 rounded-2xl border border-cinema-border/40 bg-cinema-card/20 backdrop-blur-sm transition-all duration-300 hover:border-cinema-border hover:bg-cinema-card/30'>
                                {/* Theatre Name & Address */}
                                <div className='space-y-1.5 mb-5'>
                                    <h3 className='text-lg font-bold text-white flex items-center gap-2'>
                                        <MapPin size={18} className='text-cinema-accent' /> {theatre.name}
                                    </h3>
                                    {theatre.address && (
                                        <p className='text-xs font-medium text-cinema-muted ml-6.5'>
                                            {theatre.address}, {theatre.city}
                                        </p>
                                    )}
                                </div>

                                {/* Showtimes Slot Grid */}
                                <div className='flex flex-wrap gap-3.5 pl-0 md:pl-6'>
                                    {showtimes.map((showtime) => {
                                        const isLowAvailability = showtime.available_seats < 10;
                                        return (
                                            <button
                                                key={showtime.id}
                                                onClick={() => navigate(`/booking/${showtime.id}`)}
                                                className='group/slot text-left cursor-pointer p-3 rounded-xl border border-cinema-border/60 bg-cinema-card/30 hover:bg-cinema-accent hover:border-cinema-accent transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] hover:shadow-lg hover:shadow-cinema-accent/15 min-w-[110px]'>
                                                <span className='block text-sm font-black text-white group-hover/slot:text-white transition-colors'>
                                                    {formatShowtime(showtime.starts_at)}
                                                </span>
                                                <div className='flex items-center justify-between gap-2 mt-1.5 text-[9px] font-bold text-gray-400 group-hover/slot:text-red-100 transition-colors uppercase tracking-wider'>
                                                    <span>₹{showtime.base_price}</span>
                                                    <span
                                                        className={
                                                            isLowAvailability
                                                                ? "text-amber-500 group-hover/slot:text-red-200"
                                                                : ""
                                                        }>
                                                        {showtime.available_seats} left
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MovieDetailsPage;
