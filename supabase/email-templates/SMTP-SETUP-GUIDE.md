# راهنمای تنظیم Custom SMTP و قالب ایمیل در Supabase

## گام ۱: انتخاب سرویس SMTP

توصیه‌شده برای ایران:

| سرویس       | رایگان          | مزیت                         |
|-------------|-----------------|------------------------------|
| Resend      | 3,000/ماه       | ساده‌ترین تنظیم، API مدرن     |
| Brevo       | 300/روز         | رابط فارسی‌پسند               |
| SendGrid    | 100/روز         | قابل‌اعتماد، مستندات عالی     |
| Mailgun     | 5,000/ماه (trial)| قدرتمند                      |

## گام ۲: تنظیم Custom SMTP در Supabase Dashboard

1. وارد [Supabase Dashboard](https://app.supabase.com) شوید
2. پروژه خود را انتخاب کنید
3. به مسیر زیر بروید:
   ```
   Project Settings → Authentication → SMTP Settings
   ```
4. گزینه **Enable Custom SMTP** را فعال کنید
5. مقادیر زیر را پر کنید:

```
Sender name:  گروه صنعتی مشعوف
Sender email: info@mashuf.com
Host:         smtp.resend.com          ← بستگی به سرویس
Port:         465 (SSL) یا 587 (TLS)
Username:     resend                   ← بستگی به سرویس
Password:     re_XXXXXXXXXXXXXXXXXX    ← API Key از سرویس
```

## گام ۳: قرار دادن قالب ایمیل

1. در Supabase Dashboard به این مسیر بروید:
   ```
   Authentication → Email Templates → Confirm signup
   ```
2. محتوای فایل `confirm-email.html` را کپی کنید
3. در فیلد **Message body (HTML)** پیست کنید
4. **Subject** را تنظیم کنید:
   ```
   تأیید ایمیل — گروه صنعتی مشعوف
   ```
5. دکمه **Save** را بزنید

## گام ۴: متغیرهای قالب (Template Variables)

Supabase به‌صورت خودکار این متغیرها را جایگزین می‌کند:

| متغیر                 | توضیح                          |
|-----------------------|-------------------------------|
| `{{ .Email }}`        | ایمیل کاربر                   |
| `{{ .ConfirmationURL }}` | لینک تأیید ایمیل            |
| `{{ .Token }}`        | کد OTP (برای Magic Link)      |
| `{{ .SiteURL }}`      | آدرس سایت                     |

## گام ۵: تست ارسال ایمیل

در **Authentication → Email Templates** دکمه **Send test email** را بزنید و
آدرس ایمیل خودتان را وارد کنید.

## گام ۶: تنظیم Rate Limits (اختیاری اما توصیه‌شده)

در `Authentication → Rate Limits`:
```
Email signup: 3 per hour
Password recovery: 3 per hour  
Magic link: 3 per hour
```

## گام ۷: تنظیم Redirect URL

در `Authentication → URL Configuration`:
```
Site URL:  https://mashuf.com
Redirect URLs:
  https://mashuf.com/auth/callback
  http://localhost:3000/auth/callback   ← برای توسعه محلی
```

## نکات مهم

- **لوگو در ایمیل**: کلاس `logo-icon` یک placeholder حرفی است.
  برای نمایش تصویر واقعی، این خط را در قالب جایگزین کنید:
  ```html
  <img src="https://mashuf.com/logo-gold.svg" alt="مشعوف" width="64" height="64" />
  ```

- **تست RTL**: بعد از تنظیم، ایمیل را در Gmail، Outlook و Apple Mail آزمایش کنید.

- **SPF/DKIM**: حتماً رکوردهای DNS سرویس SMTP خود را روی دامنه `mashuf.com` تنظیم کنید
  تا ایمیل‌ها در Spam نیفتند.
