import { UserResponse, LoginRequest, RegisterRequest } from '../types/user';
import { getNetworkErrorMessage, parseApiError } from '../lib/apiError';

async function requestAuth(
  endpoint: string,
  body: LoginRequest | RegisterRequest
): Promise<{ user: UserResponse; token: string }> {
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<{ user: UserResponse; token: string }> => {
    const data = await requestAuth('/api/auth/login', credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  register: async (userData: RegisterRequest): Promise<{ user: UserResponse; token: string }> => {
    const data = await requestAuth('/api/auth/register', userData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: (): UserResponse | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  validateSession: async (): Promise<UserResponse | null> => {
    const token = authService.getToken();
    if (!token) return null;

    let response: Response;
    try {
      response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      return authService.getCurrentUser();
    }

    if (!response.ok) {
      authService.logout();
      return null;
    }

    const user = await response.json();
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },
};
