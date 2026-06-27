import { useChatStore } from "../store/chatStore";
import { useNotificationStore } from "../store/notificationStore";
import { getApiBase } from "../api/client";

export const useChat = () => {
  const { messages, isLoading, addMessage, setLoading, updateLastMessage } = useChatStore();
  const { add: notify } = useNotificationStore();

  const send = async (query: string, module?: string) => {
    addMessage({ role: "user", content: query });
    addMessage({ role: "assistant", content: "", citations: [], confidence: undefined, streaming: true });
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${getApiBase()}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, module }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const event = JSON.parse(raw);

            if (event.type === "token") {
              updateLastMessage({ appendContent: event.text });
            } else if (event.type === "done") {
              updateLastMessage({
                citations: event.citations,
                confidence: event.confidence,
                confidence_label: event.confidence_label,
                streaming: false,
              });
            } else if (event.type === "abstain") {
              updateLastMessage({ content: event.text, streaming: false });
            }
          } catch {
            // malformed SSE line, skip
          }
        }
      }
    } catch {
      notify("Failed to get response", "error");
      updateLastMessage({
        content: "Sorry, I couldn't process your request. Please try again.",
        streaming: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return { messages, isLoading, send };
};