import React, { useEffect, useState } from "react";
import { movieListApi } from "../api/movieApi";
import { Star, Clock, Calendar, Search, MapPin, Film, SlidersHorizontal, Ticket } from "lucide-react";
import type { Movie } from "../types/index";
import { useNavigate } from "react-router-dom";

function MovieListPage() {
    const navigate = useNavigate();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    // Sync selected city with localStorage
    const [city, setCity] = useState(() => {
        return localStorage.getItem("selected-city") || "Ahmedabad";
    });

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("All");

    const handleCityChange = (newCity: string) => {
        setCity(newCity);
        localStorage.setItem("selected-city", newCity);
    };

    async function fetchMovieList() {
        setLoading(true);
        try {
            const res = await movieListApi(city, selectedDate);
            console.log("movies", res.movies);
            setMovies(res.movies || []);
        } catch (error) {
            console.error("Error fetching movies:", error);
            setMovies([]);
        } finally {
            setLoading(false);
        }
    }

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

    // Re-fetch when city or date changes
    useEffect(() => {
        fetchMovieList();
    }, [city, selectedDate]);

    // Extract all unique genres from the current list of movies
    const availableGenres = ["All", ...Array.from(new Set(movies.flatMap((m) => m.genre || [])))];

    // Filter movies based on search query and selected genre
    const filteredMovies = movies.filter((movie) => {
        const matchesSearch =
            movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (movie.description && movie.description.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesGenre = selectedGenre === "All" || movie.genre.includes(selectedGenre);

        return matchesSearch && matchesGenre;
    });

    return (
        <div className='min-h-screen bg-cinema-bg text-white font-sans selection:bg-cinema-accent/30 selection:text-cinema-accent'>
            {/* Elegant Header */}
            <header className='sticky top-0 z-50 border-b border-cinema-border/40 bg-cinema-surface/85 backdrop-blur-xl transition-all duration-300'>
                <div className='mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
                    {/* Brand Logo */}
                    <div className='flex items-center gap-2.5'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-cinema-accent/10 text-cinema-accent shadow-[0_0_15px_rgba(229,9,20,0.2)]'>
                            <Film size={20} className='animate-pulse' />
                        </div>
                        <span className='text-xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent'>
                            ShowTime
                        </span>
                    </div>

                    {/* Controls (Search & Location) */}
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
                        {/* Search Input */}
                        <div className='relative min-w-[260px]'>
                            <Search className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cinema-muted transition-colors group-focus-within:text-white' />
                            <input
                                type='text'
                                placeholder='Search movies, genres...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='w-full rounded-xl border border-cinema-border/60 bg-cinema-card/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-cinema-muted outline-none focus:border-cinema-accent/60 focus:bg-cinema-card focus:ring-1 focus:ring-cinema-accent/20 transition-all'
                            />
                        </div>

                        {/* Custom Location Selector */}
                        <div className='relative flex items-center'>
                            <MapPin size={16} className='absolute left-3.5 text-cinema-accent' />
                            <select
                                value={city}
                                onChange={(e) => {
                                    handleCityChange(e.target.value);
                                    setSelectedGenre("All"); // Reset filter
                                }}
                                className='appearance-none rounded-xl border border-cinema-border/60 bg-cinema-card/50 py-2.5 pl-10 pr-10 text-sm font-medium text-white outline-none focus:border-cinema-accent/60 focus:bg-cinema-card transition-all cursor-pointer min-w-[160px]'>
                                <option value='Ahmedabad'>Ahmedabad</option>
                                <option value='Mumbai'>Mumbai</option>
                                <option value='Surat'>Surat</option>
                                <option value='Vadodara'>Vadodara</option>
                            </select>
                            <div className='pointer-events-none absolute right-3.5 flex items-center text-cinema-muted'>
                                <SlidersHorizontal size={14} />
                            </div>
                        </div>

                        {/* My Tickets */}
                        <button
                            onClick={() => navigate("/my-bookings")}
                            className='flex items-center gap-2 rounded-xl border border-cinema-border/60 bg-cinema-card/50
            hover:border-cinema-accent/60 hover:bg-cinema-card px-4 py-2.5 text-sm font-medium
            text-white transition-all'>
                            <Ticket size={16} className='text-cinema-accent' />
                            My Tickets
                        </button>
                    </div>
                </div>
            </header>

            {/* Premium Date Selector */}
            <section className='border-b border-cinema-border/20 bg-cinema-surface/30 backdrop-blur-sm'>
                <div className='mx-auto max-w-7xl px-6 py-6'>
                    <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-cinema-border scrollbar-track-transparent'>
                        {dates.map((date) => {
                            const isActive = selectedDate === date.value;
                            return (
                                <button
                                    key={date.value}
                                    onClick={() => setSelectedDate(date.value)}
                                    className={`flex flex-col items-center min-w-[76px] py-3.5 px-4 rounded-2xl transition-all duration-300 relative group cursor-pointer ${
                                        isActive
                                            ? "bg-cinema-accent text-white shadow-[0_10px_20px_-5px_rgba(229,9,20,0.3)] scale-105"
                                            : "bg-cinema-card/30 text-gray-400 hover:bg-cinema-card/85 hover:text-white border border-cinema-border/40"
                                    }`}>
                                    <span className='text-[10px] font-bold uppercase tracking-wider opacity-75'>
                                        {date.weekday}
                                    </span>
                                    <span className='text-2xl font-black my-1 tracking-tight'>{date.dayNum}</span>
                                    <span className='text-[10px] font-medium tracking-wide opacity-60'>
                                        {date.month}
                                    </span>
                                    {isActive && (
                                        <span className='absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white animate-pulse' />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <main className='mx-auto max-w-7xl px-6 py-8'>
                {/* Hero / Filter Section */}
                <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8'>
                    <div>
                        <h2 className='text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'>
                            Now Showing
                        </h2>
                        <p className='mt-2.5 text-sm text-cinema-muted font-medium flex items-center gap-1.5'>
                            <span>Currently screening in</span>
                            <span className='px-2 py-0.5 rounded-md bg-cinema-accent/10 text-cinema-accent text-xs font-semibold uppercase tracking-wider'>
                                {city}
                            </span>
                        </p>
                    </div>

                    {/* Genre Filters */}
                    {movies.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                            {availableGenres.map((genre) => (
                                <button
                                    key={genre}
                                    onClick={() => setSelectedGenre(genre)}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all border ${
                                        selectedGenre === genre
                                            ? "bg-white text-cinema-bg border-white shadow-lg shadow-white/5"
                                            : "bg-cinema-card/30 text-gray-300 border-cinema-border/40 hover:bg-cinema-card/70 hover:border-cinema-border"
                                    }`}>
                                    {genre}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Movie Grid */}
                {loading ? (
                    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className='relative aspect-[2/3] w-full animate-pulse rounded-3xl bg-cinema-card/30 border border-cinema-border/20 overflow-hidden flex flex-col justify-end p-6'>
                                <div className='h-4 bg-cinema-border/60 rounded w-1/3 mb-3' />
                                <div className='h-6 bg-cinema-border/60 rounded w-3/4 mb-2' />
                                <div className='h-4 bg-cinema-border/60 rounded w-1/2' />
                            </div>
                        ))}
                    </div>
                ) : filteredMovies.length === 0 ? (
                    /* Empty State */
                    <div className='flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-cinema-border/20 bg-cinema-card/10 backdrop-blur-sm'>
                        <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-cinema-card border border-cinema-border/40 text-cinema-accent mb-5 shadow-inner'>
                            <Film size={28} />
                        </div>
                        <h3 className='text-xl font-bold text-white tracking-tight'>No Movies Found</h3>
                        <p className='mt-2 max-w-sm text-sm text-cinema-muted'>
                            {movies.length === 0
                                ? `No screenings scheduled in ${city} for this date.`
                                : "No movies match your active filters/search query."}
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setSelectedGenre("All");
                            }}
                            className='mt-6 rounded-xl bg-cinema-accent/10 border border-cinema-accent/20 px-5 py-2.5 text-xs font-semibold text-cinema-accent hover:bg-cinema-accent hover:text-white transition-all'>
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    /* Premium Movies Grid */
                    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                        {filteredMovies.map((movie) => (
                            <div
                                key={movie.id}
                                className='group relative flex flex-col h-full overflow-hidden rounded-3xl border border-cinema-border/30 bg-cinema-card/25 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-cinema-accent/30 hover:shadow-[0_20px_40px_-15px_rgba(229,9,20,0.2)]'>
                                {/* Poster Image & Rating Badge */}
                                <div className='relative aspect-[2/3] w-full overflow-hidden bg-cinema-card/50'>
                                    {movie.poster_url ? (
                                        <img
                                            src={movie.poster_url}
                                            alt={movie.title}
                                            className='h-full w-full object-cover transition-transform duration-700 group-hover:scale-105'
                                            loading='lazy'
                                        />
                                    ) : (
                                        <div className='flex h-full w-full flex-col items-center justify-center text-cinema-muted p-6'>
                                            <Film size={40} className='stroke-1 mb-2' />
                                            <span className='text-xs font-medium'>No Poster Available</span>
                                        </div>
                                    )}

                                    {/* Glassmorphic Rating Badge */}
                                    <div className='absolute right-4 top-4 flex items-center gap-1.5 rounded-xl bg-black/60 px-2.5 py-1.5 text-xs font-bold text-cinema-gold backdrop-blur-md border border-white/10 shadow-lg'>
                                        <Star size={13} fill='currentColor' />
                                        <span>{movie.rating ? movie.rating.toFixed(1) : "N/A"}</span>
                                    </div>

                                    {/* Bottom Shadow Gradient Cover */}
                                    <div className='absolute inset-0 bg-gradient-to-t from-cinema-bg via-cinema-bg/20 to-transparent opacity-90' />
                                </div>

                                {/* Content Details */}
                                <div className='flex flex-col flex-grow p-5 space-y-4 relative z-10'>
                                    {/* Title and Metadata */}
                                    <div className='space-y-1.5'>
                                        <h3 className='line-clamp-1 text-xl font-bold text-white group-hover:text-cinema-accent transition-colors duration-300'>
                                            {movie.title}
                                        </h3>
                                        <div className='flex flex-wrap gap-2'>
                                            <span className='text-[10px] font-bold text-cinema-accent bg-cinema-accent/10 border border-cinema-accent/20 px-2 py-0.5 rounded-md uppercase tracking-wider'>
                                                {movie.language}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className='line-clamp-2 text-xs font-medium text-cinema-muted leading-relaxed'>
                                        {movie.description || "No description available for this show."}
                                    </p>

                                    {/* Clock & Calendar Metrics */}
                                    <div className='flex items-center gap-4 text-xs font-semibold text-gray-400 pt-1'>
                                        <div className='flex items-center gap-1.5'>
                                            <Clock size={14} className='text-cinema-accent/80' />
                                            <span>{movie.duration_mins} mins</span>
                                        </div>
                                        <div className='flex items-center gap-1.5'>
                                            <Calendar size={14} className='text-cinema-accent/80' />
                                            <span>
                                                {new Date(movie.release_date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Genre Pills */}
                                    <div className='flex flex-wrap gap-1.5 pt-1.5'>
                                        {movie.genre &&
                                            movie.genre.map((genre) => (
                                                <span
                                                    key={genre}
                                                    className='rounded-lg border border-cinema-border/40 bg-cinema-card/45 px-2 py-1 text-[10px] font-semibold text-gray-300 tracking-wide'>
                                                    {genre}
                                                </span>
                                            ))}
                                    </div>

                                    {/* Interactive Booking Button */}
                                    <div className='pt-2 mt-auto'>
                                        <button
                                            onClick={() => navigate(`/movies/${movie.id}`)}
                                            className='w-full cursor-pointer rounded-xl bg-cinema-accent py-3 px-4 text-sm font-bold text-white shadow-[0_4px_15px_rgba(229,9,20,0.15)] hover:shadow-[0_8px_25px_rgba(229,9,20,0.3)] transition-all duration-300 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98]'>
                                            Book Tickets
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default MovieListPage;
