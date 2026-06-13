export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
