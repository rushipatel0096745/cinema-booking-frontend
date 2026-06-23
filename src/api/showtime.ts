import { api } from "./axiosInstance.ts";
import type { ApiResponse, SeatMap, Showtime } from "../types";

export interface ShowtimeFilters {
    movie_id?: string;
    city?: string;
    date?: string;
    page?: number;
    limit?: number;
}

export interface CreateShowtimePayload {
    movie_id: string;
    hall_id: string;
    starts_at: string;
    ends_at: string;
    base_price: number;
}

export interface UpdateShowtimePayload {
    starts_at?: string;
    ends_at?: string;
    base_price?: number;
    is_active?: boolean;
}

// ─── USER APIS ──────────────────────────────────────────────────────────────

/**
 * Fetches the seat map layout and status for a specific showtime.
 */
export const getSeatMap = async (showtimeId: string): Promise<SeatMap> => {
    const { data } = await api.get<ApiResponse<SeatMap>>(`/api/showtimes/${showtimeId}/seats`);
    return data.data;
};

/**
 * Fetches details for a specific showtime.
 */
export const getShowtime = async (showtimeId: string): Promise<Showtime> => {
    const { data } = await api.get<ApiResponse<Showtime>>(`/api/showtimes/${showtimeId}`);
    return data.data;
};

/**
 * Lists showtimes based on query filters.
 */
export const listShowtimes = async (filters: ShowtimeFilters): Promise<ApiResponse<Showtime[]>> => {
    const { data } = await api.get<ApiResponse<Showtime[]>>("/api/showtimes", {
        params: filters,
    });
    return data;
};

// ─── ADMIN APIS ─────────────────────────────────────────────────────────────

/**
 * Creates a new showtime. (Admin only)
 */
export const createShowtime = async (payload: CreateShowtimePayload): Promise<Showtime> => {
    const { data } = await api.post<ApiResponse<Showtime>>("/api/showtimes", payload);
    return data.data;
};

/**
 * Updates an existing showtime. (Admin only)
 */
export const updateShowtime = async (showtimeId: string, payload: UpdateShowtimePayload): Promise<Showtime> => {
    const { data } = await api.put<ApiResponse<Showtime>>(`/api/showtimes/${showtimeId}`, payload);
    return data.data;
};

/**
 * Deletes a showtime. (Admin only)
 */
export const deleteShowtime = async (showtimeId: string): Promise<void> => {
    await api.delete(`/api/showtimes/${showtimeId}`);
};
