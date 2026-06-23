import { useQuery } from "@tanstack/react-query";
import { getBooking } from "../api/bookings";

// polls GET /bookings/:id every 2s until status is confirmed or max retries hit
export function useBookingStatus(bookingId: string | null) {
    return useQuery({
        queryKey: ["booking", bookingId],
        queryFn: () => getBooking(bookingId!),
        enabled: !!bookingId,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            // stop polling once confirmed or cancelled
            if (status === "confirmed" || status === "cancelled" || status === "refunded") {
                return false;
            }
            return 2000; // poll every 2s while pending
        },
        retry: 5,
    });
}
