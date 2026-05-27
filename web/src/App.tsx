import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/hooks/useAuth";
import { SubscriptionProvider } from "@/hooks/useSubscription";
import { RequireSubscription } from "@/components/RequireSubscription";
import { useEffect } from "react";

import Index from "./pages/Index";
import Generator from "./pages/Generator";
import Results from "./pages/Results";
import Alignment from "./pages/Alignment";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Resources from "./pages/Resources";
import Subscribe from "./pages/Subscribe";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function AppShell() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/admin");
  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route
          path="/generator"
          element={
            <RequireSubscription>
              <Generator />
            </RequireSubscription>
          }
        />
        <Route
          path="/results"
          element={
            <RequireSubscription>
              <Results />
            </RequireSubscription>
          }
        />
        <Route
          path="/alignment"
          element={
            <RequireSubscription>
              <Alignment />
            </RequireSubscription>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
