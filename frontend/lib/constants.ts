export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'سام درب'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://samdoor.com'
export const SITE_DESCRIPTION =
  'سام درب — پیشرو در ساخت درب‌های ضد سرقت لوکس و پرمیوم. با بهترین تکنولوژی روز دنیا و طراحی مدرن، امنیت و زیبایی را به خانه شما می‌آوریم.'

export const CONTACT = {
  phone: '۰۲۱-۸۸۰۰۰۰۰۰',
  mobile: '۰۹۱۲-۰۰۰۰۰۰۰',
  email: 'info@samdoor.com',
  address: 'تهران، خیابان ولیعصر، برج سام',
  workingHours: 'شنبه تا چهارشنبه ۸ تا ۱۷، پنجشنبه ۸ تا ۱۳',
}

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/samdoor',
  telegram: 'https://t.me/samdoor',
  whatsapp: 'https://wa.me/989120000000',
  linkedin: 'https://linkedin.com/company/samdoor',
  youtube: 'https://youtube.com/@samdoor',
}

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 12,
  adminLimit: 20,
}

export const IMAGE_QUALITY = 85

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/zip']

export const ORDER_STATUSES = {
  pending: { label: 'در انتظار تأیید', color: 'warning' },
  confirmed: { label: 'تأیید شده', color: 'success' },
  processing: { label: 'در حال پردازش', color: 'primary' },
  shipped: { label: 'ارسال شده', color: 'primary' },
  delivered: { label: 'تحویل داده شده', color: 'success' },
  cancelled: { label: 'لغو شده', color: 'danger' },
  refunded: { label: 'مسترد شده', color: 'muted' },
  on_hold: { label: 'معلق', color: 'warning' },
} as const

export const PAYMENT_STATUSES = {
  pending: { label: 'در انتظار پرداخت', color: 'warning' },
  paid: { label: 'پرداخت شده', color: 'success' },
  failed: { label: 'ناموفق', color: 'danger' },
  refunded: { label: 'بازگشت داده شده', color: 'muted' },
  partial: { label: 'پرداخت ناقص', color: 'warning' },
} as const

export const STOCK_STATUSES = {
  in_stock: { label: 'موجود', color: 'success' },
  out_of_stock: { label: 'ناموجود', color: 'danger' },
  pre_order: { label: 'پیش‌سفارش', color: 'warning' },
  discontinued: { label: 'تولید متوقف', color: 'muted' },
} as const

export const SORT_OPTIONS = [
  { label: 'جدیدترین', value: 'newest' },
  { label: 'قدیمی‌ترین', value: 'oldest' },
  { label: 'ارزان‌ترین', value: 'price_asc' },
  { label: 'گران‌ترین', value: 'price_desc' },
  { label: 'پربازدیدترین', value: 'most_viewed' },
  { label: 'بهترین امتیاز', value: 'best_rated' },
] as const

export const PROVINCES = [
  'تهران', 'اصفهان', 'مشهد', 'شیراز', 'تبریز', 'اهواز', 'کرمانشاه',
  'ارومیه', 'رشت', 'زاهدان', 'همدان', 'کرمان', 'یزد', 'قم', 'بندرعباس',
  'اراک', 'اردبیل', 'بجنورد', 'بیرجند', 'بوشهر', 'خرم‌آباد', 'زنجان',
  'ساری', 'سمنان', 'سنندج', 'شهرکرد', 'قزوین', 'گرگان', 'مهاباد',
  'یاسوج',
]

export const CURRENCY = 'تومان'
export const CURRENCY_CODE = 'IRR'

export const WHATSAPP_BUSINESS = {
  phone: '989120000000',
  defaultMessage: 'سلام، می‌خواهم درباره درب‌های سام بیشتر بدانم',
}
