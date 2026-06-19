import { useAuthStore } from "../store/useAuthStore";
import type { LoginPayload, RegisterPayload, AuthResult } from "../types/auth";
import type { User } from "../types/auth";

interface UseAuthReturn {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (payload: LoginPayload) => Promise<AuthResult>;
    register: (payload: RegisterPayload) => Promise<AuthResult>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
    const store = useAuthStore();

    return {
        user: store.user,
        isAuthenticated: !!store.accessToken && !!store.user,
        isLoading: store.isLoading,
        error: store.error,
        login: store.login,
        register: store.register,
        logout: store.logout,
        clearError: store.clearError,
    };
};
