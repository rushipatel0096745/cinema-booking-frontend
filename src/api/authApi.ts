import { api } from "./axiosInstance";
import type { AuthResponse, ApiAuthResponse, LoginPayload, RegisterPayload, AuthTokens } from "../types/auth";

export const loginApi = async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post<ApiAuthResponse>("/auth/login", payload);
    return res.data.data;
};

export const registerApi = async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post<ApiAuthResponse>("/auth/register", payload);
    return res.data.data;
};

export const refreshTokenApi = async (refresh_token: string): Promise<AuthTokens> => {
    const res = await api.post<{ success: boolean; data: AuthTokens }>("/auth/refresh", { refresh_token });
    return res.data.data;
};

export const logoutApi = async (refresh_token: string): Promise<void> => {
    try {
        await api.post("/auth/logout", { refresh_token });
    } catch {
        // best-effort; client logout proceeds regardless
    }
};
