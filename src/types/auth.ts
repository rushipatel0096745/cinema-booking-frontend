export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

// Actual API envelope: { success: true, data: AuthResponse }
export interface ApiAuthResponse {
  success: boolean;
  data: AuthResponse;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}