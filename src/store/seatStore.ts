import { create } from "zustand";
import type { SeatMap, SeatCell } from "../types";

interface SeatState {
    seatMap: SeatMap | null;
    selectedIds: Set<string>;
    setSeatMap: (map: SeatMap) => void;
    updateSeatStatuses: (ids: string[], status: SeatCell["status"]) => void;
    toggleSeat: (id: string, status: SeatCell["status"]) => void;
    clearSelection: () => void;
}

export const useSeatStore = create<SeatState>((set) => ({
    seatMap: null,
    selectedIds: new Set(),

    setSeatMap: (seatMap) => set({ seatMap }),

    // called by WebSocket events — only update changed seats
    updateSeatStatuses: (ids, status) =>
        set((state) => {
            if (!state.seatMap) return state;
            const idSet = new Set(ids);
            return {
                seatMap: {
                    ...state.seatMap,
                    rows: state.seatMap.rows.map((row) => ({
                        ...row,
                        seats: row.seats.map((seat) => (idSet.has(seat.id) ? { ...seat, status } : seat)),
                    })),
                },
                // deselect seats that are no longer available
                selectedIds: new Set([...state.selectedIds].filter((id) => !idSet.has(id))),
            };
        }),

    toggleSeat: (id, status) =>
        set((state) => {
            if (status !== "available") return state;
            const next = new Set(state.selectedIds);
            next.has(id) ? next.delete(id) : next.add(id);
            return { selectedIds: next };
        }),

    clearSelection: () => set({ selectedIds: new Set() }),
}));
