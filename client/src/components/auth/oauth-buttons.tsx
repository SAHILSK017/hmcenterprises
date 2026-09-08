"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Loader2 } from "lucide-react";

export function OAuthButtons({ mode = "login" }: { mode?: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { oauthLogin } = useAuth();
  const [busy, setBusy] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");

  const handleSuccess = (user: { role?: string }) => {
    toast.success(mode === "register" ? "Account created with Google" : "Signed in with Google");
    const callback = searchParams.get("callbackUrl") || searchParams.get("next") || null;
    if (callback) router.push(callback);
    else router.push(user.role === "admin" ? "/admin" : "/");
    router.refresh();
  };

  const handleGoogleOAuth = async (emailToUse?: string, nameToUse?: string) => {
    try {
      setBusy(true);
      const targetEmail = emailToUse || googleEmail.trim() || "user@gmail.com";
      const targetName = nameToUse || googleName.trim() || targetEmail.split("@")[0];

      const user = await oauthLogin({
        provider: "google",
        providerId: `g_${Math.abs(hashString(targetEmail))}`,
        email: targetEmail,
        name: targetName,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetName)}&backgroundColor=0d9488,14b8a6,0f766e`,
      });

      setShowPrompt(false);
      handleSuccess(user);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to sign in with Google");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative my-5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Or continue with
        </div>
      </div>

      <div>
        {/* Full Width Google OAuth Button */}
        <button
          type="button"
          onClick={() => setShowPrompt(true)}
          disabled={busy}
          className="relative flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin text-[#0D9488]" />
          ) : (
            <GoogleLogo className="h-5 w-5 shrink-0" />
          )}
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Interactive Google Sign-In Dialog */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
                <GoogleLogo className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sign in with Google</h3>
                <p className="text-xs text-slate-500">to continue to HMC Mobile</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Google Account Email
                </label>
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Your Name"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
                />
              </div>

              <div className="pt-2">
                <p className="text-[11px] font-medium text-slate-400 mb-2">Or quick select test profile:</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleEmail("rahul.sharma@gmail.com");
                      setGoogleName("Rahul Sharma");
                    }}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    rahul.sharma@gmail.com
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleEmail("priya.verma@gmail.com");
                      setGoogleName("Priya Verma");
                    }}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    priya.verma@gmail.com
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPrompt(false)}
                className="h-9 rounded-lg px-3 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleGoogleOAuth()}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-[#0D9488] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#0F766E] disabled:opacity-50 cursor-pointer"
              >
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Authorize Google
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
