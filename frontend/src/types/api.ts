export interface ApiResponse<T> { data: T; status: number; }
export interface TokenResponse { access_token: string; token_type: string; role: string; full_name: string; user_id: number; }
export interface ChatResponse { answer: string; citations: any[]; confidence: number; query: string; model: string; }
export interface PaginatedResponse<T> { items: T[]; total: number; page: number; size: number; }
