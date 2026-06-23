import { create } from "zustand";

interface BookingState {
    // lock step
    lockedSeatIds: string[];
    lockExpiresAt: string | null;
    totalAmount: number;

    // create booking step
    bookingId: string | null;
    clientSecret: string | null;
    stripePublishableKey: string | null;

    setLock: (seatIds: string[], expiresAt: string, total: number) => void;
    setBooking: (bookingId: string, clientSecret: string, publishableKey: string) => void;
    clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
    lockedSeatIds: [],
    lockExpiresAt: null,
    totalAmount: 0,
    bookingId: null,
    clientSecret: null,
    stripePublishableKey: null,

    setLock: (seatIds, expiresAt, total) =>
        set({ lockedSeatIds: seatIds, lockExpiresAt: expiresAt, totalAmount: total }),

    setBooking: (bookingId, clientSecret, publishableKey) =>
        set({ bookingId, clientSecret, stripePublishableKey: publishableKey }),

    clearBooking: () =>
        set({
            lockedSeatIds: [],
            lockExpiresAt: null,
            totalAmount: 0,
            bookingId: null,
            clientSecret: null,
            stripePublishableKey: null,
        }),
}));
