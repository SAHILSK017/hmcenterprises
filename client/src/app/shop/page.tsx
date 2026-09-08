import { Suspense } from "react";
import ShopPage from "./shop-page-client";

export default function ShopRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f1f3f6] p-6">
          <div className="mx-auto max-w-6xl space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-xl bg-white" />
            ))}
          </div>
        </div>
      }
    >
      <ShopPage />
    </Suspense>
  );
}
