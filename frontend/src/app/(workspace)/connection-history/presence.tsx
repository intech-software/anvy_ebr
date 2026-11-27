"use client";

import { useEffect } from "react";

const endpoint = "/api/connection-history";
const tabStorage = "anvy-ebr.connection-tab";

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function ConnectionPresence() {
  useEffect(() => {
    let tab = uuid();
    const instance = uuid();
    let connection = instance;
    const receive = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(tabStorage);
    let ready = false;
    let connected = false;
    let pending = false;
    let stopped = false;
    let hidden = false;
    try {
      tab = sessionStorage.getItem(tabStorage) || tab;
    } catch { /* Keep the in-memory tab ID. */ }

    if (receive) receive.onmessage = ({ data }: MessageEvent<{ tab: string; type: string; connection: string }>) => {
      if (data?.tab !== tab || data.connection === instance) return;
      if (data.type === "probe" && (ready || instance < data.connection)) {
        receive.postMessage({ type: "owned", tab, connection: instance });
      } else if (!ready) {
        tab = uuid();
        receive.postMessage({ type: "probe", tab, connection: instance });
      }
    };
    receive?.postMessage({ type: "probe", tab, connection: instance });

    async function heartbeat() {
      if (!ready || stopped || hidden || pending) return;
      pending = true;
      const key = connection;
      const send = (event: string) => fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event, tab, connection: key }),
        signal: AbortSignal.timeout(8000),
      });
      try {
        let response = await send(connected ? "beat" : "connect");
        if (response.status === 409 && key === connection && !hidden && !stopped) response = await send("connect");
        connected = response.ok && !hidden && key === connection;
        if (response.status === 401) stopped = true;
      } catch {
        connected = false;
      } finally {
        pending = false;
        if (key !== connection) void heartbeat();
      }
    }

    function disconnect() {
      if (!ready || hidden || stopped) return;
      hidden = true;
      connected = false;
      const body = new Blob([JSON.stringify({ event: "disconnect", tab, connection })], {
        type: "application/json",
      });
      if (!navigator.sendBeacon?.(endpoint, body)) {
        void fetch(endpoint, { method: "POST", body, keepalive: true }).catch(() => null);
      }
    }
    function resume() {
      if (hidden) connection = uuid();
      hidden = false;
      void heartbeat();
    }

    const first = setTimeout(() => {
      ready = true;
      try {
        sessionStorage.setItem(tabStorage, tab);
      } catch { /* Keep the in-memory tab ID. */ }
      void heartbeat();
    }, 120);
    const timer = setInterval(() => void heartbeat(), 20_000);
    window.addEventListener("pagehide", disconnect);
    window.addEventListener("pageshow", resume);
    window.addEventListener("online", resume);
    document.addEventListener("visibilitychange", heartbeat);
    return () => {
      disconnect();
      stopped = true;
      clearTimeout(first);
      clearInterval(timer);
      receive?.close();
      window.removeEventListener("pagehide", disconnect);
      window.removeEventListener("pageshow", resume);
      window.removeEventListener("online", resume);
      document.removeEventListener("visibilitychange", heartbeat);
    };
  }, []);
  return null;
}
