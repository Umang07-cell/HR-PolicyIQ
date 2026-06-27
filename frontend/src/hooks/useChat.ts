import { useChatStore } from "../store/chatStore";
import { useNotificationStore } from "../store/notificationStore";
import { sendChat } from "../api/chat";

export const useChat = () => {
  const { messages, isLoading, addMessage, setLoading } = useChatStore();
  const { add: notify } = useNotificationStore();

  const send = async (query: string, module?: string) => {
    addMessage({ role: "user", content: query });
    setLoading(true);
    try {
      const res = await sendChat(query, module);
      const { answer, citations, confidence } = res.data;
      addMessage({ role: "assistant", content: answer, citations, confidence });
    } catch {
      notify("Failed to get response", "error");
      addMessage({ role: "assistant", content: "Sorry, I couldn't process your request. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return { messages, isLoading, send };
};
