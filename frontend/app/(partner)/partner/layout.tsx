import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME, PARTNER_PANEL_ROLES, type UserRole } from "@/types";

export const dynamic = "force-dynamic";

export default async function PartnerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/partner/dashboard");
  }

  const { data } = await supabase.rpc("get_my_role");
  const role = (data as UserRole | null) ?? null;

  if (!role || !PARTNER_PANEL_ROLES.includes(role)) {
    redirect(role ? ROLE_HOME[role] : "/");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" dir="rtl">
      {children}
    </div>
  );
}
