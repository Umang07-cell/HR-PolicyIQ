import { client } from "./client";
export const login = (email: string, password: string) => client.post("/auth/login", { email, password });
export const register = (data: any) => client.post("/auth/register", data);
export const getMe = () => client.get("/auth/me");
