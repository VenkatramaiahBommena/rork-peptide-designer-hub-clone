/**
 * Subscription + activity log context.
 * Tracks paid status per-user in localStorage (demo payment flow).
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export interface ActivityEvent {
  id: string;
  type: "login" | "logout" | "signup" | "payment_success" | "payment_failed" | "error" | "subscribe" | "page_view";
  email: string | null;
  message: string;
  meta?: Record<string, unknown>;
  timestamp: number;
}

interface SubscriptionContextType {
  isSubscribed: (email: string | null | undefined) => boolean;
  activateSubscription: (email: string, txnId: string) => void;
  logEvent: (type: ActivityEvent["type"], message: string, email?: string | null, meta?: Record<string, unknown>) => void;
  events: ActivityEvent[];
  refreshEvents: () => void;
  subscribedEmails: string[];
}

const SUB_KEY = "dvks:subscribed_emails";
const EVENTS_KEY = "dvks:activity_events";

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

function readSubs(): string[] {
  try {
    const raw = localStorage.getItem(SUB_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function readEvents(): ActivityEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? (JSON.parse(raw) as ActivityEvent[]) : [];
  } catch {
    return [];
  }
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscribedEmails, setSubscribedEmails] = useState<string[]>([]);
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    setSubscribedEmails(readSubs());
    setEvents(readEvents());
  }, []);

  const refreshEvents = useCallback(() => {
    setEvents(readEvents());
    setSubscribedEmails(readSubs());
  }, []);

  const isSubscribed = useCallback(
    (email: string | null | undefined) => {
      if (!email) return false;
      return subscribedEmails.includes(email.toLowerCase());
    },
    [subscribedEmails],
  );

  const activateSubscription = useCallback((email: string, txnId: string) => {
    const list = readSubs();
    const norm = email.toLowerCase();
    if (!list.includes(norm)) list.push(norm);
    localStorage.setItem(SUB_KEY, JSON.stringify(list));
    setSubscribedEmails(list);

    const ev: ActivityEvent = {
      id: crypto.randomUUID(),
      type: "subscribe",
      email: norm,
      message: `Subscription activated — ₹2000 INR paid (txn: ${txnId})`,
      meta: { txnId, amount: 2000, currency: "INR" },
      timestamp: Date.now(),
    };
    const all = readEvents();
    all.unshift(ev);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(all.slice(0, 500)));
    setEvents(all.slice(0, 500));
  }, []);

  const logEvent = useCallback<SubscriptionContextType["logEvent"]>(
    (type, message, email, meta) => {
      const ev: ActivityEvent = {
        id: crypto.randomUUID(),
        type,
        email: email?.toLowerCase() ?? null,
        message,
        meta,
        timestamp: Date.now(),
      };
      const all = readEvents();
      all.unshift(ev);
      const trimmed = all.slice(0, 500);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
      setEvents(trimmed);
    },
    [],
  );

  return (
    <SubscriptionContext.Provider
      value={{ isSubscribed, activateSubscription, logEvent, events, refreshEvents, subscribedEmails }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextType {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}
