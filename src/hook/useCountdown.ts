import { useState, useEffect, useRef } from "react";

interface CountdownResult {
    minutes: number;
    seconds: number;
    isExpired: boolean;
    formatted: string; // "09:42"
}

export function useCountdown(expiresAt: string | null): CountdownResult {
    const getRemaining = () => {
        if (!expiresAt) return 0;
        return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    };

    const [remaining, setRemaining] = useState(getRemaining);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!expiresAt) return;
        setRemaining(getRemaining());

        intervalRef.current = setInterval(() => {
            setRemaining(getRemaining());
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [expiresAt]);

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return {
        minutes,
        seconds,
        isExpired: remaining === 0 && !!expiresAt,
        formatted: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    };
}
