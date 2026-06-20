import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SuperSidebar } from "@/components/admin/super-sidebar";
import { SuperTopbar } from "@/components/admin/super-topbar";
import { ROLE_HOME, type UserRole } from "@/types";

export const dynamic = "force-dynamic";

export default async function SuperDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/admin/super-dashboard");

  const { data } = await supabase.rpc("get_my_role");
  const role = (data as UserRole | null) ?? null;

  if (role !== "super_admin") {
    redirect(role ? ROLE_HOME[role] : "/");
  }

  return (
    <div
      className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100"
      dir="rtl"
    >
      <SuperSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <SuperTopbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
