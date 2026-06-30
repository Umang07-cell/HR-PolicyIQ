import { client } from "./client";
export const sendChat = (query: string, module?: string) => client.post("/chat/", { query, module });
export const sendChatFeedback = (query: string, is_positive: boolean, suggestion?: string) => 
    client.post("/chat/feedback", { query, is_positive, suggestion });

