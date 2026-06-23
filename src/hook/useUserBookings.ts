import { useQuery } from "@tanstack/react-query";
import { getUserBookings } from "../api/bookings";

export function useUserBookings(status?: string, page = 1, limit = 10) {
    return useQuery({
        queryKey: ["bookings", { status, page, limit }],
        queryFn: () => getUserBookings(status, page, limit),
        staleTime: 30_000, // 30s — bookings don't change that often
    });
}
