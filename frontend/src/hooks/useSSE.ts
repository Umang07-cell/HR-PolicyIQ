import { useEffect, useRef } from "react";

export const useSSE = (url: string, onMessage: (data: any) => void) => {
  const esRef = useRef<EventSource | null>(null);
  useEffect(() => {
    esRef.current = new EventSource(url);
    esRef.current.onmessage = (e) => { try { onMessage(JSON.parse(e.data)); } catch { onMessage(e.data); } };
    return () => esRef.current?.close();
  }, [url]);
};
