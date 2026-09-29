export interface AdminSession {
  email: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}
