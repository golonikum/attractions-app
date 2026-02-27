import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

const navItems = [
  { href: "/main", label: "Карта" },
  { href: "/groups", label: "Города" },
  { href: "/gallery", label: "Галерея" },
  { href: "/search", label: "Поиск" },
];

export function Navigation() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isMobile } = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-1001 border-b bg-background">
      <div className="container lg:max-w-full mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="text-foreground"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          ) : (
            <div className="flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          <div className="flex h-16 items-center space-x-4">
            <ThemeToggle />
            <Button onClick={() => logout()} variant="outline">
              Выйти
            </Button>
          </div>
        </div>
        {isMobile && isMenuOpen && (
          <div className="border-t py-4">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary px-4 py-2",
                    pathname === item.href
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <PWAInstallPrompt />
    </nav>
  );
}
