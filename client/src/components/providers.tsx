"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";
import { CartProvider } from "@/components/shop/cart-context";
import { WishlistProvider } from "@/components/shop/wishlist-context";
import { AuthProvider } from "@/components/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
          <CartProvider>
            <WishlistProvider>
              {children}
              <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{ className: "font-sans" }}
              />
            </WishlistProvider>
          </CartProvider>
        </NextThemesProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
