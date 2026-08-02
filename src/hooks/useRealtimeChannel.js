import { useEffect, useRef, useCallback } from 'react';

export default function useRealtimeChannel(channelName, onMessage) {
  const bcRef = useRef(null);
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    try {
      const bc = new BroadcastChannel(channelName);
      bcRef.current = bc;
      bc.onmessage = (event) => handlerRef.current?.(event.data);
      return () => bc.close();
    } catch {
      // BroadcastChannel not supported
    }
  }, [channelName]);

  const send = useCallback((data) => {
    bcRef.current?.postMessage(data);
  }, []);

  return { send };
}