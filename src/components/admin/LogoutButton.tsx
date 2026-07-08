"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/80 transition hover:border-gold-400 hover:text-gold-300"
    >
      <LogOut className="h-4 w-4" strokeWidth={1.75} />
      Logout
    </button>
  );
}
