import { useEffect, useCallback, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Types for event handlers
type EventHandler = (...args: any[]) => void;

interface GameEvents {
  'PlayerJoined': EventHandler;
  'GameMove': EventHandler;
  'GameEnded': EventHandler;
  'ChatMessage': EventHandler;
}

export const useGameWebSocket = (matchId: number | null) => {
  // Keep references to event handlers to avoid unnecessary re-subscriptions
  const eventHandlers = useRef<Partial<GameEvents>>({});
  const channelRef = useRef<any>(null);
  const echoRef = useRef<Echo | null>(null);

  // Initialize Echo instance if it doesn't exist
  const initializeEcho = useCallback(() => {
    if (!echoRef.current && typeof window !== 'undefined') {
      // @ts-ignore - We have to set Pusher on the window due to Echo's implementation
      window.Pusher = Pusher;
      
      echoRef.current = new Echo({
        broadcaster: 'pusher',
        key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || 'eu',
        forceTLS: true
      });
    }
    
    return echoRef.current;
  }, []);

  // Subscribe to a channel and register event handlers
  const subscribe = useCallback((matchId: number) => {
    const echo = initializeEcho();
    if (!echo) return;

    // Unsubscribe from previous channel if exists
    if (channelRef.current) {
      echo.leave(`match.${channelRef.current}`);
    }

    // Subscribe to the match's private channel
    channelRef.current = matchId;
    const channel = echo.private(`match.${matchId}`);

    // Register event handlers
    if (eventHandlers.current.PlayerJoined) {
      channel.listen('PlayerJoined', eventHandlers.current.PlayerJoined);
    }
    
    if (eventHandlers.current.GameMove) {
      channel.listen('GameMove', eventHandlers.current.GameMove);
    }
    
    if (eventHandlers.current.GameEnded) {
      channel.listen('GameEnded', eventHandlers.current.GameEnded);
    }
    
    if (eventHandlers.current.ChatMessage) {
      channel.listen('ChatMessage', eventHandlers.current.ChatMessage);
    }

    return channel;
  }, [initializeEcho]);

  // Subscribe to events when match ID changes
  useEffect(() => {
    if (matchId) {
      subscribe(matchId);
    }

    return () => {
      // Cleanup on unmount
      const echo = echoRef.current;
      if (echo && channelRef.current) {
        echo.leave(`match.${channelRef.current}`);
        channelRef.current = null;
      }
    };
  }, [matchId, subscribe]);

  // Register event handlers
  const onPlayerJoined = useCallback((callback: EventHandler) => {
    eventHandlers.current.PlayerJoined = callback;
    
    const echo = echoRef.current;
    const matchChannel = channelRef.current;
    
    if (echo && matchChannel) {
      const channel = echo.private(`match.${matchChannel}`);
      channel.listen('PlayerJoined', callback);
    }
  }, []);

  const onGameMove = useCallback((callback: EventHandler) => {
    eventHandlers.current.GameMove = callback;
    
    const echo = echoRef.current;
    const matchChannel = channelRef.current;
    
    if (echo && matchChannel) {
      const channel = echo.private(`match.${matchChannel}`);
      channel.listen('GameMove', callback);
    }
  }, []);

  const onGameEnded = useCallback((callback: EventHandler) => {
    eventHandlers.current.GameEnded = callback;
    
    const echo = echoRef.current;
    const matchChannel = channelRef.current;
    
    if (echo && matchChannel) {
      const channel = echo.private(`match.${matchChannel}`);
      channel.listen('GameEnded', callback);
    }
  }, []);

  const onChatMessage = useCallback((callback: EventHandler) => {
    eventHandlers.current.ChatMessage = callback;
    
    const echo = echoRef.current;
    const matchChannel = channelRef.current;
    
    if (echo && matchChannel) {
      const channel = echo.private(`match.${matchChannel}`);
      channel.listen('ChatMessage', callback);
    }
  }, []);

  return {
    onPlayerJoined,
    onGameMove,
    onGameEnded,
    onChatMessage,
    isConnected: !!channelRef.current
  };
}; 