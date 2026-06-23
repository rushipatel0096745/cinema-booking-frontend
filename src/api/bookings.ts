import { api } from "./axiosInstance.ts";
import type { ApiResponse, Booking, PriceSummary } from "../types";

export interface LockSeatsResponse {
    lock_expires_at: string;
    seat_ids: string[];
    total_amount: number;
}

export interface CreateBookingResponse {
    booking_id: string;
    client_secret: string;
    total_amount: number;
    currency: string;
    stripe_publishable_key: string;
    breakdown: PriceSummary;
}

export const lockSeats = async (showtimeId: string, seatIds: string[]): Promise<LockSeatsResponse> => {
    const { data } = await api.post<ApiResponse<LockSeatsResponse>>("/api/bookings/lock-seats", {
        showtime_id: showtimeId,
        seat_ids: seatIds,
    });
    return data.data;
};

export const createBooking = async (showtimeId: string, seatIds: string[]): Promise<CreateBookingResponse> => {
    const { data } = await api.post<ApiResponse<CreateBookingResponse>>("/api/bookings", {
        showtime_id: showtimeId,
        seat_ids: seatIds,
    });
    return data.data;
};

export const getBooking = async (bookingId: string): Promise<Booking> => {
    const { data } = await api.get<ApiResponse<Booking>>(`/api/bookings/${bookingId}`);
    return data.data;
};

export const getUserBookings = async (status?: string, page = 1, limit = 10): Promise<ApiResponse<Booking[]>> => {
    const { data } = await api.get<ApiResponse<Booking[]>>("/api/bookings", {
        params: { status, page, limit },
    });
    return data;
};

export const cancelBooking = async (bookingId: string, reason?: string): Promise<void> => {
    await api.post(`/api/bookings/${bookingId}/cancel`, { reason });
};
