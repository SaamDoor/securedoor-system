import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ROLES, ROLE_HOME, type UserRole } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/admin/dashboard");
  }

  const { data } = await supabase.rpc("get_my_role");
  const role = (data as UserRole | null) ?? null;

  if (!role || !ADMIN_ROLES.includes(role)) {
    redirect(role ? ROLE_HOME[role] : "/");
  }

  return (
    <div className="flex min-h-screen bg-black">
      <AdminSidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
