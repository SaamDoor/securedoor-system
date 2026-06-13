import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { UserSidebar } from "@/components/user/user-sidebar";
import { Navbar } from "@/components/layout/navbar";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME, USER_PANEL_ROLES, type UserRole } from "@/types";

export default async function UserLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/user/dashboard");
  }

  const { data } = await supabase.rpc("get_my_role");
  const role = (data as UserRole | null) ?? null;

  if (!role || !USER_PANEL_ROLES.includes(role)) {
    redirect(role ? ROLE_HOME[role] : "/");
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black">
        <div className="container py-8">
          <div className="flex gap-6">
            <UserSidebar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
    </>
  );
}
