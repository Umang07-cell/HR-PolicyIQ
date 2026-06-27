import { client } from "./client";
export const sendChat = (query: string, module?: string) => client.post("/chat/", { query, module });
