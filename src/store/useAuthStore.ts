import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginApi, registerApi, logoutApi } from "../api/authApi";
import type { User, LoginPayload, RegisterPayload, AuthResult } from "../types/auth";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setTokens: (accessToken: string, refreshToken: string) => void;
    login: (payload: LoginPayload) => Promise<AuthResult>;
    register: (payload: RegisterPayload) => Promise<AuthResult>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: null,

            setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

            login: async (payload) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await loginApi(payload);
                    set({
                        user: data.user,
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                        isLoading: false,
                    });
                    return { success: true };
                } catch (err: unknown) {
                    const message = extractErrorMessage(err) ?? "Login failed";
                    set({ isLoading: false, error: message });
                    return { success: false, error: message };
                }
            },

            register: async (payload) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await registerApi(payload);
                    set({
                        user: data.user,
                        accessToken: data.access_token,
                        refreshToken: data.refresh_token,
                        isLoading: false,
                    });
                    return { success: true };
                } catch (err: unknown) {
                    const message = extractErrorMessage(err) ?? "Registration failed";
                    set({ isLoading: false, error: message });
                    return { success: false, error: message };
                }
            },

            logout: async () => {
                const { refreshToken } = get();
                if (refreshToken) await logoutApi(refreshToken);
                set({ user: null, accessToken: null, refreshToken: null, error: null });
            },

            clearError: () => set({ error: null }),
        }),
        {
            name: "auth-storage",
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
        }
    )
);

// ─── Helper ───────────────────────────────────────────────────────────────
function extractErrorMessage(err: unknown): string | undefined {
    if (typeof err === "object" && err !== null && "response" in err) {
        const res = (err as { response?: { data?: { message?: string; error?: string } } }).response;
        return res?.data?.message ?? res?.data?.error;
    }
    return undefined;
}
