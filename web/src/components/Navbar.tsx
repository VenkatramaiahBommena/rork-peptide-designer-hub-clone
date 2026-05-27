import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dna,
  FlaskConical,
  AlignCenter,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  Beaker,
  Database,
} from "lucide-react";
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";

const navItems = [
  { path: "/", label: "Home", icon: Dna },
  { path: "/generator", label: "Generator", icon: FlaskConical },
  { path: "/results", label: "Results", icon: Dna },
  { path: "/alignment", label: "Alignment", icon: AlignCenter },
  { path: "/resources", label: "Resources", icon: Database },
];

const cdmoNav = { path: "/#cdmo-services", label: "CDMO Services", icon: Beaker };

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#00b8d9] flex items-center justify-center">
              <Dna className="w-5 h-5 text-[#0a0f1e]" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-[#00d4aa]">Pepti</span>
              <span className="text-foreground">Forge</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.path === "/resources" 
                ? location.pathname === "/resources"
                : location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-[#00d4aa]/15 text-[#00d4aa]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to={cdmoNav.path}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                location.hash === "#cdmo-services"
                  ? "bg-[#f59e0b]/15 text-[#f59e0b]"
                  : "text-muted-foreground hover:text-[#f59e0b] hover:bg-[#f59e0b]/5",
              )}
            >
              <cdmoNav.icon className="w-4 h-4" />
              {cdmoNav.label}
            </Link>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2">
            <SearchBar />
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {!subscribed ? (
                  <Link to="/subscribe">
                    <Button size="sm" className="h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold">
                      <Crown className="w-3.5 h-3.5 mr-1" /> ₹2000
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#00d4aa]/10 border border-[#00d4aa]/30 text-[#00d4aa] text-[10px] font-semibold">
                    <Crown className="w-3 h-3" /> PRO
                  </div>
                )}
                <Link
                  to="/profile"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    location.pathname === "/profile"
                      ? "bg-[#00d4aa]/15 text-[#00d4aa]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.name || user.email}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { logEvent("logout", `Signed out: ${user.email}`, user.email); signOut(); }}
                  className="text-muted-foreground hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#00d4aa]/30 text-[#00d4aa] hover:bg-[#00d4aa]/10 hover:border-[#00d4aa]/60"
                >
                  <LogIn className="w-4 h-4 mr-1.5" />
                  Sign In
                </Button>
              </Link>
            )}
            <Link to="/admin" className="text-muted-foreground/60 hover:text-red-300 p-1.5" title="Admin Console">
              <Shield className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-border/30 pt-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  location.pathname === item.path
                    ? "bg-[#00d4aa]/15 text-[#00d4aa]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <Link
              to={cdmoNav.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                location.hash === "#cdmo-services"
                  ? "bg-[#f59e0b]/15 text-[#f59e0b]"
                  : "text-muted-foreground hover:text-[#f59e0b]",
              )}
            >
              <cdmoNav.icon className="w-4 h-4" />
              {cdmoNav.label}
            </Link>
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#00d4aa]"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
