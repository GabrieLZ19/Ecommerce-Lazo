"use client";

import Link from "next/link";
import {
  ShoppingBag,
  User,
  Menu,
  Search,
  LogOut,
  UserCircle,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useClientCart } from "@/hooks/useClientCart";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { itemsCount } = useClientCart();
  const { user, signOut, loading, isConfigured } = useAuth();

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Productos", href: "/products" },
    { name: "Hombres", href: "/products?category=men" },
    { name: "Mujeres", href: "/products?category=women" },
    { name: "Accesorios", href: "/products?category=accessories" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold">LAZO</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Button>

          {/* User Account */}
          {!loading && (
            <>
              {user && isConfigured ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2"
                    >
                      <UserCircle className="h-5 w-5" />
                      <span className="hidden sm:block">
                        {user.user_metadata?.full_name ||
                          `${user.user_metadata?.first_name || ""} ${
                            user.user_metadata?.last_name || ""
                          }`.trim() ||
                          user.email?.split("@")[0] ||
                          "Usuario"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.user_metadata?.full_name ||
                        `${user.user_metadata?.first_name || ""} ${
                          user.user_metadata?.last_name || ""
                        }`.trim() ||
                        user.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>Mis Órdenes</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href={isConfigured ? "/login" : "/setup"}>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Cuenta</span>
                  </Button>
                </Link>
              )}
            </>
          )}

          {/* Shopping Cart */}
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                  {itemsCount}
                </span>
              )}
              <span className="sr-only">Carrito de compras</span>
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                ))}
                <hr className="my-4" />
                {user && isConfigured ? (
                  <>
                    <Link href="/profile" className="text-sm font-medium">
                      Mi Perfil
                    </Link>
                    <Link href="/orders" className="text-sm font-medium">
                      Mis Órdenes
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="justify-start p-0 text-sm font-medium"
                    >
                      Cerrar Sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href={isConfigured ? "/login" : "/setup"}
                      className="text-sm font-medium"
                    >
                      {isConfigured ? "Iniciar Sesión" : "Configurar App"}
                    </Link>
                    {isConfigured && (
                      <Link href="/register" className="text-sm font-medium">
                        Registrarse
                      </Link>
                    )}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
