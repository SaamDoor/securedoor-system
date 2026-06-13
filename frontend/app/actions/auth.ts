"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { phoneToAuthEmail } from "@/lib/utils";
import { ROLE_HOME, type UserRole } from "@/types/auth";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mashuf.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export interface PasswordResetResult {
  ok: boolean;
  emailSent: boolean;
}

export interface SignInWithPasswordResult {
  ok: false;
  error: string;
}

export async function signInWithPassword(
  phone: string,
  password: string,
): Promise<SignInWithPasswordResult> {
  const supabase = await createServerSupabaseClient();
  const authEmail = phoneToAuthEmail(phone);

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!authData.user) {
    return { ok: false, error: "User not found" };
  }

  // Use the service-role client so RLS never blocks this fetch
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  const role = (profile?.role as string | null) ?? "customer";
  const cookieStore = await cookies();

  cookieStore.set("user_role", role, {
    path: "/",
    sameSite: "lax",
    maxAge: ROLE_COOKIE_MAX_AGE,
    httpOnly: false,
  });

  redirect(ROLE_HOME[role as UserRole] ?? ROLE_HOME.customer);
}

/**
 * Generates a password-recovery link for the given phone number and — if the
 * user registered a contact email — emails the link via Resend.
 *
 * Always returns ok:true even when the phone isn't found, to avoid revealing
 * whether a number is registered (security best-practice).
 */
export async function requestPasswordReset(
  phone: string,
): Promise<PasswordResetResult> {
  try {
    const admin = createAdminClient();
    const authEmail = phoneToAuthEmail(phone); // ph_09XXXXXXXXX@mashuf.com

    // Generate a PKCE recovery link — error if user doesn't exist
    const { data: linkData, error: linkErr } =
      await admin.auth.admin.generateLink({
        type: "recovery",
        email: authEmail,
        options: {
          // Callback route exchanges the code → sets session → redirects to update-password
          redirectTo: `${SITE_URL}/auth/callback?next=/auth/update-password`,
        },
      });

    if (linkErr || !linkData?.properties?.action_link) {
      // User not found or other server error — don't leak info
      return { ok: true, emailSent: false };
    }

    const contactEmail = linkData.user?.user_metadata?.contact_email as
      | string
      | undefined;

    if (!contactEmail) {
      // User never provided a contact email — they must contact support
      return { ok: true, emailSent: false };
    }

    if (!RESEND_API_KEY) {
      console.warn(
        "[requestPasswordReset] RESEND_API_KEY not set — cannot send email",
      );
      return { ok: true, emailSent: false };
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "گروه صنعتی مشعوف <noreply@mashuf.com>",
        to: [contactEmail],
        subject: "بازیابی رمز عبور — گروه صنعتی مشعوف",
        html: buildResetEmailHtml(linkData.properties.action_link),
      }),
    });

    if (!emailRes.ok) {
      console.error(
        "[requestPasswordReset] Resend API error:",
        emailRes.status,
      );
      return { ok: false, emailSent: false };
    }

    return { ok: true, emailSent: true };
  } catch (err) {
    console.error("[requestPasswordReset] unexpected error:", err);
    return { ok: false, emailSent: false };
  }
}

function buildResetEmailHtml(link: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Tahoma,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0"
             style="background:#111111;border-radius:16px;border:1px solid rgba(200,168,93,0.25);overflow:hidden;max-width:480px">
        <!-- Header -->
        <tr>
          <td style="padding:28px 32px;background:linear-gradient(135deg,rgba(200,168,93,0.1),transparent);border-bottom:1px solid rgba(200,168,93,0.15)">
            <div style="font-size:18px;font-weight:900;color:#fff">گروه صنعتی مشعوف</div>
            <div style="font-size:11px;color:#C8A85D;letter-spacing:2px;margin-top:4px">MASHOUF INDUSTRIAL GROUP</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <h2 style="color:#fff;font-size:20px;margin:0 0 14px;font-weight:900">بازیابی رمز عبور</h2>
            <p style="color:#aaaaaa;font-size:14px;line-height:1.9;margin:0 0 28px">
              درخواست بازیابی رمز عبور برای حساب شما دریافت شد.<br>
              برای تنظیم رمز عبور جدید روی دکمه زیر کلیک کنید.<br>
              این لینک <strong style="color:#fff">۱ ساعت</strong> اعتبار دارد.
            </p>
            <a href="${link}"
               style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#C8A85D,#E7D3A5);color:#000000;text-decoration:none;border-radius:10px;font-weight:900;font-size:15px">
              تنظیم رمز عبور جدید
            </a>
            <p style="color:#555555;font-size:12px;margin-top:28px;line-height:1.9">
              اگر این درخواست از طرف شما نبوده، این ایمیل را نادیده بگیرید.<br>
              رمز عبور شما بدون تأیید تغییر نخواهد کرد.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06)">
            <p style="color:#444;font-size:11px;margin:0;line-height:1.7">
              این ایمیل به‌صورت خودکار ارسال شده است — لطفاً پاسخ ندهید.<br>
              پشتیبانی: 09003286539
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
