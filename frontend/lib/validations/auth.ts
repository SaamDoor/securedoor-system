import { z } from 'zod'
import { isValidIranPhone } from '@/lib/utils'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'ایمیل الزامی است')
    .email('فرمت ایمیل صحیح نیست'),
  password: z
    .string()
    .min(6, 'رمز عبور حداقل ۶ کاراکتر باشد'),
  rememberMe: z.boolean().optional().default(false),
})

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'نام حداقل ۲ کاراکتر باشد'),
    lastName: z.string().min(2, 'نام خانوادگی حداقل ۲ کاراکتر باشد'),
    email: z.string().min(1, 'ایمیل الزامی است').email('فرمت ایمیل صحیح نیست'),
    phone: z
      .string()
      .min(1, 'شماره موبایل الزامی است')
      .refine(isValidIranPhone, 'شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)'),
    password: z
      .string()
      .min(8, 'رمز عبور حداقل ۸ کاراکتر باشد')
      .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
      .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد'),
    confirmPassword: z.string().min(1, 'تکرار رمز عبور الزامی است'),
    acceptTerms: z.boolean().refine(Boolean, 'پذیرش قوانین الزامی است'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'ایمیل الزامی است').email('فرمت ایمیل صحیح نیست'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'رمز عبور حداقل ۸ کاراکتر باشد')
      .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
      .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد'),
    confirmPassword: z.string().min(1, 'تکرار رمز عبور الزامی است'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند',
    path: ['confirmPassword'],
  })

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'نام حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی حداقل ۲ کاراکتر باشد'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || isValidIranPhone(v), 'شماره موبایل معتبر نیست'),
  bio: z.string().max(300, 'بیوگرافی حداکثر ۳۰۰ کاراکتر').optional(),
  company: z.string().max(200, 'نام شرکت حداکثر ۲۰۰ کاراکتر').optional(),
  website: z.string().url('آدرس وبسایت معتبر نیست').optional().or(z.literal('')),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'رمز عبور فعلی الزامی است'),
    newPassword: z
      .string()
      .min(8, 'رمز عبور جدید حداقل ۸ کاراکتر باشد')
      .regex(/[A-Z]/, 'رمز عبور باید حداقل یک حرف بزرگ داشته باشد')
      .regex(/[0-9]/, 'رمز عبور باید حداقل یک عدد داشته باشد'),
    confirmNewPassword: z.string().min(1, 'تکرار رمز عبور جدید الزامی است'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'رمز عبور جدید و تکرار آن یکسان نیستند',
    path: ['confirmNewPassword'],
  })

export const addressSchema = z.object({
  label: z.string().min(1, 'عنوان آدرس الزامی است').max(100),
  recipientName: z.string().min(2, 'نام تحویل‌گیرنده الزامی است').max(200),
  phone: z
    .string()
    .min(1, 'شماره تماس الزامی است')
    .refine(isValidIranPhone, 'شماره موبایل معتبر نیست'),
  province: z.string().min(1, 'استان الزامی است'),
  city: z.string().min(1, 'شهر الزامی است'),
  district: z.string().max(100).optional(),
  street: z.string().min(5, 'آدرس دقیق الزامی است').max(500),
  postalCode: z
    .string()
    .min(10, 'کد پستی ۱۰ رقم باشد')
    .max(10, 'کد پستی ۱۰ رقم باشد')
    .regex(/^\d{10}$/, 'کد پستی باید ۱۰ رقم باشد'),
  isDefault: z.boolean().optional().default(false),
})

export const contactSchema = z.object({
  name: z.string().min(2, 'نام حداقل ۲ کاراکتر باشد').max(200),
  email: z.string().min(1, 'ایمیل الزامی است').email('فرمت ایمیل صحیح نیست'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || isValidIranPhone(v), 'شماره موبایل معتبر نیست'),
  subject: z.string().min(3, 'موضوع حداقل ۳ کاراکتر باشد').max(300),
  message: z.string().min(10, 'پیام حداقل ۱۰ کاراکتر باشد').max(2000),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type AddressFormData = z.infer<typeof addressSchema>
export type ContactFormData = z.infer<typeof contactSchema>
