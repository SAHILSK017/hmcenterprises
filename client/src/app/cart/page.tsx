"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/components/shop/cart-context";
import { formatCurrency } from "@/lib/utils";
import { PageSection } from "@/components/layout/page-section";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (!items.length) {
    return (
      <PageSection innerClassName="flex justify-center">
        <Card className="mx-auto w-full max-w-lg text-center">
          <CardContent className="py-12">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <h1 className="mt-4 font-display text-2xl font-bold">Your cart is empty</h1>
            <Button className="mt-5" asChild>
              <Link href="/shop">Browse phones</Link>
            </Button>
          </CardContent>
        </Card>
      </PageSection>
    );
  }

  return (
    <PageSection centered={false} innerClassName="py-0">
      <h1 className="mb-6 font-display text-3xl font-bold">Your cart</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardContent className="divide-y p-0">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 p-4">
                <div className="h-20 w-20 overflow-hidden rounded-[var(--radius)] bg-muted">
                  {item.image && (
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.condition}</p>
                  <p className="mt-1 font-semibold text-brand">{formatCurrency(item.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-5 text-center text-sm">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-status-danger"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <b>{formatCurrency(subtotal)}</b>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Shipping and tax calculated at checkout.
            </p>
            <Button className="mt-5 w-full" asChild>
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageSection>
  );
}
