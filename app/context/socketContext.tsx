"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextValue {
    socket: Socket | null;
    connected: boolean;
}

const SocketContext = createContext<SocketContextValue | null>(null);

/** Read a cookie value from document.cookie by name */
function getClientCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

export function SocketProvider({
    children,
    token: serverToken,
}: {
    children: ReactNode;
    token: string | null;
}) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState<boolean>(false);

    // Prefer the fresh client-side cookie over the potentially stale server prop
    const [liveToken, setLiveToken] = useState<string | null>(serverToken);

    useEffect(() => {
        const freshToken = getClientCookie("access_token");
        if (freshToken && freshToken !== liveToken) {
            setLiveToken(freshToken);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (serverToken && serverToken !== liveToken) {
            setLiveToken(serverToken);
        }
    }, [serverToken]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!liveToken) {
            console.warn("No token available — skipping socket connection");
            return;
        }

        const newSocket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
            transports: ["websocket"],
            auth: { token: liveToken },
        });

        newSocket.on("connect", () => {
            console.log("✅ Socket connected:", newSocket.id);
            setConnected(true);
        });

        newSocket.on("disconnect", () => {
            console.log("❌ Socket disconnected");
            setConnected(false);
        });

        newSocket.on("connect_error", (err: Error) => {
            console.error("Socket connection error:", err.message);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [liveToken]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket(): SocketContextValue {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
}