"use client";

import React, { useEffect, useState } from "react";
import { baseUrl, sendRequest } from "@/app/static/core_function";
import { useAuth } from "@/app/context/AuthContext";
import HistoryTable, { HistoryEntry } from "@/app/components/HistoryTable";

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await sendRequest(
        `${baseUrl}/history`,
        "GET",
        undefined,
        "history",
        { token: true },
        token ?? undefined,
      );
      const res = response as any;
      if (res.result) {
        const normalized = res.data.map((entry: any) => {
          const rolls = Array.isArray(entry.result_gacha)
            ? entry.result_gacha
            : typeof entry.result_gacha === "string"
              ? JSON.parse(entry.result_gacha)
              : [];

          return {
            ...entry,
            result_gacha: rolls.map((item: any) => ({
              ...item,
              drop_rate: parseFloat(item.drop_rate) * 100,
            })),
          };
        });
        setHistory(normalized);
      }
    } catch (err) {
      console.error("fetch History:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-foreground">
          Summon History
        </h2>
        <p className="text-sm text-muted">
          Audit trail of every gacha roll session across all summoners.
        </p>
      </div>

      <HistoryTable data={history} loading={loading} />
    </div>
  );
}