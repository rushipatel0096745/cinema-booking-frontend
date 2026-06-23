import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSeatStore } from "../store/seatStore";
import { getSeatMap } from "../api/showtime";
import type { SeatStatusEvent } from "../types";

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8080";

export function useSeatMap(showtimeId: string) {
    const { setSeatMap, updateSeatStatuses } = useSeatStore();

    const query = useQuery({
        queryKey: ["seatmap", showtimeId],
        queryFn: () => getSeatMap(showtimeId),
        staleTime: Infinity, // WebSocket keeps it fresh
        enabled: !!showtimeId,
    });

    // sync fetched data into zustand
    useEffect(() => {
        if (query.data) setSeatMap(query.data);
    }, [query.data]);

    // WebSocket for live updates
    useEffect(() => {
        if (!showtimeId) return;

        const ws = new WebSocket(`${WS_URL}/ws/showtimes/${showtimeId}`);

        ws.onmessage = (e) => {
            const event: SeatStatusEvent = JSON.parse(e.data);
            if (["seats_locked", "seats_booked", "seats_released"].includes(event.type)) {
                updateSeatStatuses(event.seat_ids, event.status);
            }
        };

        ws.onerror = (e) => console.error("ws error", e);

        return () => ws.close(); // cleanup on unmount
    }, [showtimeId]);

    return query;
}
