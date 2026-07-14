// components/GachaSocketListener.tsx
"use client";

import { useEffect } from "react";
import { useSocket } from "../context/socketContext";
import { useUser } from "../context/UserContext";


export function GachaSocketListener() {
  const { socket } = useSocket();
  const { updateCoins } = useUser();

  useEffect(() => {
    if (!socket) return;

    const onGachaResult = (payload: { remaining_coins: number }) => {
      updateCoins(payload.remaining_coins);
    };

    socket.on("gacha_result", onGachaResult);
    return () => {
      socket.off("gacha_result", onGachaResult);
    };
  }, [socket, updateCoins]);

  return null;
}