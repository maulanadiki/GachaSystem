import { useEffect, useRef } from "react";
import { APIResponse, OptionRequest } from "./Types";
import { getAuthTokenServer } from "@/app/Middleware/AccessToken";

export const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
export const PLACEHOLDER_IMAGE = "/placeholder-item.png";
export const getImageSrc = (src: string) => (src && src.trim() !== "" ? src : PLACEHOLDER_IMAGE);

export async function sendRequest<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  data?: unknown,
  ShaWord?: string | undefined,
  options?: OptionRequest,
  valToken?: string
): Promise<APIResponse<T>> {
  const headers: HeadersInit = {};

  if (!options?.isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  if (options?.token && valToken) {
    headers.Authorization = `Bearer ${valToken}`;
    if (ShaWord) {
      headers["X-Access-Sha"] = await GenerateSha256(ShaWord);
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body:
      method !== "GET"
        ? options?.isMultipart
          ? (data as FormData)
          : JSON.stringify(data)
        : undefined,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
}



export async function GenerateSha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function RealTimeData(trigger: () => void, typePayload: string, msg: string | null) {
  const socketRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const wsUrl = socketUrl?.includes("localhost")
      ? `${socketUrl.replace("http", "ws")}/ws`
      : "wss://domain.domain.com/ws";
    const socket = new WebSocket(wsUrl);
    socket.onopen = () => console.log("Websocket Connected");
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === typePayload) {
          trigger();
          if (msg) console.log("Websocket : ", msg);
        }
      } catch (err) {
        console.error("WS Parse Error", err);
      }
    };
    socket.onerror = (error) => console.error("WebSocket Error:", error);
    socket.onclose = () => console.log("🔌 WebSocket Disconnected");
    socketRef.current = socket;
    return () => socket.close();
  }, [trigger, msg]);
}

export const fileToBase64 = (blobUrl: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(blobUrl);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                resolve(base64String); 
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        } catch (e) {
            reject(e);
        }
    });
};