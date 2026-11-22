import { io } from 'socket.io-client';

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to realtime gateway, socket ID:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected from realtime gateway:', reason);
    });
  }

  return socketInstance;
};
