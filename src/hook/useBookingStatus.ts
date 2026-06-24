import { useQuery } from "@tanstack/react-query";
import { getBooking } from "../api/bookings";
import { useState } from "react";

// // polls GET /bookings/:id every 2s until status is confirmed or max retries hit
// export function useBookingStatus(bookingId: string | null) {
//     return useQuery({
//         queryKey: ["booking", bookingId],
//         queryFn: () => getBooking(bookingId!),
//         enabled: !!bookingId,
//         refetchInterval: (query) => {
//             const status = query.state.data?.status;
//             // stop polling once confirmed or cancelled
//             if (status === "confirmed" || status === "cancelled" || status === "refunded") {
//                 return false;
//             }
//             return 2000; // poll every 2s while pending
//         },
//         retry: 5,
//     });
// }

export function useBookingStatus(bookingId: string | null) {
    const [pollCount, setPollCount] = useState(0);

    return useQuery({
        queryKey: ["booking", bookingId],
        queryFn: () => {
            setPollCount((c) => c + 1);
            return getBooking(bookingId!);
        },
        enabled: !!bookingId,
        refetchInterval: (query) => {
            const status = query.state.data?.status;

            // stop polling when confirmed or failed
            if (status === "confirmed" || status === "cancelled" || status === "refunded") {
                return false;
            }

            // stop after 15 attempts (~30 seconds) — webhook probably failed
            if (pollCount >= 15) {
                return false;
            }

            return 2000;
        },
        retry: 3,
    });
}
