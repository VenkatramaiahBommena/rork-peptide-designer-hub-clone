import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import type { ReactNode } from "react";

export function RequireSubscription({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isSubscribed } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00d4aa]/30 border-t-[#00d4aa] rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isSubscribed(user.email)) return <Navigate to="/subscribe" replace />;
  return <>{children}</>;
}
