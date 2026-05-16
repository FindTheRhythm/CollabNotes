import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = (import.meta.env.VITE_WS_URL as string) || `${window.location.protocol.replace('http','ws')}//${window.location.hostname}:4000`;
    const token = localStorage.getItem('accessToken');
    socket = io(url, { withCredentials: true, auth: { token } });
  }
  return socket!;
}

export default getSocket;
