// export interface User {
//   id: string
//   email: string
//   name: string
//   phone?: string
//   avatar_url?: string
//   role: 'user' | 'admin'
// }

// export interface AuthResponse {
//   access_token: string
//   refresh_token: string
//   user: User
// }

export interface Movie {
    id: string;
    title: string;
    description: string;
    duration_mins: number;
    genre: string[];
    language: string;
    poster_url?: string;
    trailer_url?: string;
    release_date: string;
    rating: number;
}

export interface Theatre {
    id: string;
    name: string;
    city: string;
    address?: string;
    lat?: number;
    lng?: number;
}

export interface Hall {
    id: string;
    theatre_id: string;
    name: string;
    total_rows: number;
    total_cols: number;
    total_seats: number;
}

export interface Showtime {
    id: string;
    movie_id: string;
    hall_id: string;
    starts_at: string;
    ends_at: string;
    base_price: number;
    is_active: boolean;
    movie?: Movie;
    hall?: Hall;
    theatre?: Theatre;
    available_seats: number;
    booked_seats: number;
}

export interface SeatCell {
    id: string;
    col: number;
    type: "standard" | "premium" | "recliner";
    status: "available" | "locked" | "booked";
    price: number;
    is_aisle: boolean;
}

export interface SeatRow {
    label: string;
    seats: SeatCell[];
}

export interface SeatMap {
    showtime_id: string;
    rows: SeatRow[];
}

export interface BookedSeat {
    booking_id: string;
    showtime_seat_id: string;
    price: number;
    row_label: string;
    col_number: number;
    seat_type: string;
}

export interface Booking {
    id: string;
    user_id: string;
    showtime_id: string;
    status: "pending" | "confirmed" | "cancelled" | "refunded";
    qr_code_url?: string;
    created_at: string;
    confirmed_at?: string;
    seats?: BookedSeat[];
    showtime?: Showtime;
    subtotal: number;
    convenience_fee: number;
    taxes: number;
    total_amount: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
    meta?: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

export interface SeatStatusEvent {
    type: "seats_locked" | "seats_booked" | "seats_released";
    showtime_id: string;
    seat_ids: string[];
    status: "available" | "locked" | "booked";
}

export interface CityShowtimes {
    city: string;
    theatres: TheatreShowtimes[];
}

export interface TheatreShowtimes {
    theatre: Theatre;
    showtimes: Showtime[];
}

export interface MovieShowtimesResponse {
    movie_id: string;
    cities: CityShowtimes[];
}

export interface PriceSummary {
    items: PriceLineItem[];
    sub_total: number;
    convenience_fee: number;
    taxes: number;
    total: number;
    currency: string;
}

export interface PriceLineItem {
    showtime_seat_id: string;
    row_label: string;
    col_number: number;
    seat_type: string;
    base_price: number;
}

export interface CreateBookingResponse {
    booking_id: string;
    client_secret: string;
    total_amount: number;
    currency: string;
    stripe_publishable_key: string;
    breakdown: PriceSummary;
}
