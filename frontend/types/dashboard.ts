// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL SETTINGS TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type SettingKey =
  // Hero
  | 'hero_title'
  | 'hero_subtitle'
  | 'hero_cta_text'
  | 'hero_cta_url'
  | 'hero_image_url'
  // Contact
  | 'contact_phone'
  | 'contact_phone_2'
  | 'contact_email'
  | 'contact_address'
  | 'contact_map_embed'
  | 'working_hours'
  // Financial
  | 'tax_rate_percent'
  | 'global_commission_pct'
  | 'min_payout_amount'
  // Banner / announcement
  | 'announcement_text'
  | 'is_announcement_active'
  | 'announcement_color'
  // General / branding
  | 'site_name'
  | 'site_logo_url'
  | 'site_favicon_url'
  | 'footer_about'
  // Social
  | 'social_instagram'
  | 'social_telegram'
  | 'social_whatsapp'
  | 'social_linkedin'

/** Typed map for O(1) access to setting values in components. */
export interface SettingsMap {
  hero_title:             string
  hero_subtitle:          string
  hero_cta_text:          string
  hero_cta_url:           string
  hero_image_url:         string
  contact_phone:          string
  contact_phone_2:        string
  contact_email:          string
  contact_address:        string
  contact_map_embed:      string
  working_hours:          string
  tax_rate_percent:       number
  global_commission_pct:  number
  min_payout_amount:      number
  announcement_text:      string
  is_announcement_active: boolean
  announcement_color:     string
  site_name:              string
  site_logo_url:          string
  site_favicon_url:       string
  footer_about:           string
  social_instagram:       string
  social_telegram:        string
  social_whatsapp:        string
  social_linkedin:        string
}

export const SETTINGS_DEFAULTS: SettingsMap = {
  hero_title:             'به گروه صنعتی مشعوف خوش آمدید',
  hero_subtitle:          'تولیدکننده درب‌های فلزی صنعتی و ضدسرقت',
  hero_cta_text:          'مشاهده محصولات',
  hero_cta_url:           '/products',
  hero_image_url:         '',
  contact_phone:          '',
  contact_phone_2:        '',
  contact_email:          '',
  contact_address:        '',
  contact_map_embed:      '',
  working_hours:          '',
  tax_rate_percent:       9,
  global_commission_pct:  5,
  min_payout_amount:      500000,
  announcement_text:      '',
  is_announcement_active: false,
  announcement_color:     'blue',
  site_name:              'گروه صنعتی مشعوف',
  site_logo_url:          '',
  site_favicon_url:       '',
  footer_about:           '',
  social_instagram:       '',
  social_telegram:        '',
  social_whatsapp:        '',
  social_linkedin:        '',
}

export interface SettingRecord {
  key:         SettingKey
  value:       string | number | boolean | object
  group:       string
  description?: string
  is_public:   boolean
  updated_at:  string
}

// ─────────────────────────────────────────────────────────────────────────────
//  WALLET & TRANSACTIONS
// ─────────────────────────────────────────────────────────────────────────────

export type WalletTxType = 'credit' | 'debit' | 'commission' | 'refund' | 'withdrawal' | 'purchase'

export interface Wallet {
  id:              string
  user_id:         string
  balance:         number
  pending_balance: number
  lifetime_earned: number
  currency:        string
  updated_at:      string
}

export interface WalletTransaction {
  id:             string
  wallet_id:      string
  user_id:        string
  type:           WalletTxType
  amount:         number
  balance_after:  number
  reference_id?:  string
  reference_type?: 'order' | 'commission' | 'payout' | 'refund'
  description?:   string
  created_at:     string
}

// ─────────────────────────────────────────────────────────────────────────────
//  AFFILIATE / COMMISSION
// ─────────────────────────────────────────────────────────────────────────────

export type PayoutStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export interface AffiliateCommissionConfig {
  id:                    string
  user_id:               string | null  // null = global default
  commission_percentage: number
  is_global_default:     boolean
  note?:                 string
  updated_at:            string
}

export interface AffiliateReferral {
  id:                      string
  referrer_id:             string
  referred_user_id?:       string
  order_id?:               string
  referral_code:           string
  commission_pct_snapshot: number
  commission_amount?:      number
  status:                  PayoutStatus
  approved_by?:            string
  approved_at?:            string
  created_at:              string
}

export interface PayoutRequest {
  id:              string
  user_id:         string
  wallet_id:       string
  amount:          number
  method:          'iban' | 'wallet_credit' | 'card'
  iban?:           string
  bank_name?:      string
  account_holder?: string
  status:          PayoutStatus
  user_note?:      string
  admin_note?:     string
  receipt_url?:    string
  requested_at:    string
  reviewed_at?:    string
  reviewed_by?:    string
}

// ─────────────────────────────────────────────────────────────────────────────
//  BUILDER TIERS  (VIP / support role)
// ─────────────────────────────────────────────────────────────────────────────

export type BuilderTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface BuilderTierConfig {
  id:                  string
  tier:                BuilderTier
  label:               string
  discount_percentage: number
  min_order_volume:    number
  benefits:            string[]
  is_active:           boolean
  updated_at:          string
}

// ─────────────────────────────────────────────────────────────────────────────
//  BULK QUOTES
// ─────────────────────────────────────────────────────────────────────────────

export type QuoteStatus = 'submitted' | 'reviewing' | 'quoted' | 'accepted' | 'rejected' | 'cancelled'

export interface BulkQuote {
  id:                  string
  quote_number:        string
  user_id:             string
  title:               string
  description?:        string
  estimated_qty?:      number
  door_specs?:         Record<string, unknown>
  attachments?:        string[]
  status:              QuoteStatus
  quoted_amount?:      number
  valid_until?:        string
  admin_note?:         string
  assigned_to?:        string
  converted_order_id?: string
  created_at:          string
  updated_at:          string
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUPPORT TICKETS
// ─────────────────────────────────────────────────────────────────────────────

export type TicketStatus   = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface SupportTicket {
  id:             string
  ticket_number:  string
  user_id:        string
  order_id?:      string
  subject:        string
  status:         TicketStatus
  priority:       TicketPriority
  is_vip:         boolean
  assigned_to?:   string
  resolved_at?:   string
  created_at:     string
  updated_at:     string
}

export interface TicketMessage {
  id:           string
  ticket_id:    string
  sender_id:    string
  message:      string
  attachments?: string[]
  is_internal:  boolean
  created_at:   string
}

// ─────────────────────────────────────────────────────────────────────────────
//  SEO
// ─────────────────────────────────────────────────────────────────────────────

export interface SeoSetting {
  id:               string
  page_slug:        string
  page_label?:      string
  meta_title?:      string
  meta_description?: string
  meta_keywords?:   string[]
  og_image_url?:    string
  canonical_url?:   string
  noindex:          boolean
  structured_data?: Record<string, unknown>
  updated_at:       string
}

// ─────────────────────────────────────────────────────────────────────────────
//  MEDIA LIBRARY
// ─────────────────────────────────────────────────────────────────────────────

export type MediaFileType = 'image' | 'pdf' | 'document' | 'video' | 'other'

export interface MediaFile {
  id:            string
  file_name:     string
  storage_path:  string
  public_url:    string
  file_type:     MediaFileType
  mime_type?:    string
  file_size?:    number
  width?:        number
  height?:       number
  alt_text?:     string
  folder:        string
  tags?:         string[]
  uploaded_by?:  string
  created_at:    string
}

// ─────────────────────────────────────────────────────────────────────────────
//  PRICE CHANGE TRACKER
// ─────────────────────────────────────────────────────────────────────────────

export interface PriceChangeRecord {
  id:           string
  resource:     string
  resource_id:  string
  old_value:    Record<string, unknown>
  new_value:    Record<string, unknown>
  changed_by:   string
  created_at:   string
}
