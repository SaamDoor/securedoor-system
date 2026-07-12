'use client'

import { useCallback, useEffect, useState } from 'react'
import { BadgeCheck, Banknote, Eye, Loader2, Plus, ReceiptText, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  createBankAccount,
  getAdminBankAccounts,
  getAdminBankTransferReceipts,
  getReceiptSignedUrl,
  reviewBankTransfer,
  setBankAccountVisibility,
  type BankAccount,
  type BankTransferReceipt,
} from '@/lib/api/banking'

const emptyAccount = {
  bank_name: '',
  account_holder: '',
  account_number: '',
  card_number: '',
  iban: '',
  branch_name: '',
  description: '',
  display_order: 0,
}

export default function BankTransfersAdminPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [receipts, setReceipts] = useState<BankTransferReceipt[]>([])
  const [form, setForm] = useState(emptyAccount)
  const [tab, setTab] = useState<'accounts' | 'receipts'>('accounts')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [accountRows, receiptRows] = await Promise.all([
        getAdminBankAccounts(),
        getAdminBankTransferReceipts(),
      ])
      setAccounts(accountRows)
      setReceipts(receiptRows)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'خطا در دریافت اطلاعات بانکی')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    if (!form.card_number && !form.account_number && !form.iban) {
      toast.error('حداقل شماره کارت، حساب یا شبا را وارد کنید')
      return
    }
    setSaving(true)
    try {
      await createBankAccount(form)
      setForm(emptyAccount)
      toast.success('حساب ثبت شد؛ پس از تأیید می‌توانید آن را نمایش دهید')
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ثبت حساب ناموفق بود')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAccount(account: BankAccount, mode: 'verify' | 'active') {
    try {
      const verified = mode === 'verify' ? !account.is_verified : account.is_verified
      const active = mode === 'active' ? !account.is_active : account.is_active
      await setBankAccountVisibility(account.id, verified, active)
      toast.success('وضعیت حساب به‌روزرسانی شد')
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'به‌روزرسانی ناموفق بود')
    }
  }

  async function review(receipt: BankTransferReceipt, status: 'approved' | 'rejected') {
    const note = window.prompt(status === 'approved' ? 'یادداشت تأیید (اختیاری)' : 'دلیل رد رسید') ?? ''
    if (status === 'rejected' && !note.trim()) return
    try {
      await reviewBankTransfer(receipt.id, status, note)
      toast.success(status === 'approved' ? 'رسید تأیید و کیف پول شارژ شد' : 'رسید رد شد')
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'بررسی رسید ناموفق بود')
    }
  }

  async function openReceipt(path: string) {
    try {
      window.open(await getReceiptSignedUrl(path), '_blank', 'noopener,noreferrer')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'نمایش فایل ممکن نیست')
    }
  }

  return (
    <div dir="rtl" className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">حساب‌ها و واریزهای بانکی</h1>
        <p className="mt-1 text-sm text-muted">حساب‌های قابل نمایش و رسیدهای واریزی کاربران را مدیریت کنید.</p>
      </div>

      <div className="flex w-fit gap-1 rounded-xl border border-white/8 bg-surface p-1">
        <button onClick={() => setTab('accounts')} className={`rounded-lg px-4 py-2 text-sm ${tab === 'accounts' ? 'bg-gold text-black' : 'text-muted'}`}>حساب‌های بانکی</button>
        <button onClick={() => setTab('receipts')} className={`rounded-lg px-4 py-2 text-sm ${tab === 'receipts' ? 'bg-gold text-black' : 'text-muted'}`}>
          رسیدها ({receipts.filter((item) => item.status === 'pending').length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-gold" /></div>
      ) : tab === 'accounts' ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="rounded-2xl border border-white/8 bg-surface p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-gold/10 p-3 text-gold"><Banknote className="h-5 w-5" /></div>
                    <div>
                      <div className="font-bold text-white">{account.bank_name} — {account.account_holder}</div>
                      <div className="mt-1 space-y-1 text-xs text-muted" dir="ltr">
                        {account.card_number && <div>{account.card_number.replace(/(.{4})/g, '$1 ').trim()}</div>}
                        {account.iban && <div>{account.iban}</div>}
                        {account.account_number && <div>{account.account_number}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleAccount(account, 'verify')} className={`rounded-xl border px-3 py-2 text-xs ${account.is_verified ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-white/10 text-muted'}`}>
                      {account.is_verified ? 'تأیید شده' : 'تأیید حساب'}
                    </button>
                    <button disabled={!account.is_verified} onClick={() => toggleAccount(account, 'active')} className={`rounded-xl border px-3 py-2 text-xs disabled:opacity-40 ${account.is_active ? 'border-gold/30 bg-gold/10 text-gold' : 'border-white/10 text-muted'}`}>
                      {account.is_active ? 'نمایش به کاربران' : 'عدم نمایش'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {accounts.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-muted">حسابی ثبت نشده است.</div>}
          </div>

          <form onSubmit={handleCreate} className="h-fit space-y-3 rounded-2xl border border-white/8 bg-surface p-5">
            <div className="mb-4 flex items-center gap-2 font-bold text-white"><Plus className="h-4 w-4 text-gold" /> حساب جدید</div>
            {([
              ['bank_name', 'نام بانک *'],
              ['account_holder', 'نام صاحب حساب *'],
              ['card_number', 'شماره کارت ۱۶ رقمی'],
              ['account_number', 'شماره حساب'],
              ['iban', 'شماره شبا با IR'],
              ['branch_name', 'نام شعبه'],
            ] as const).map(([key, placeholder]) => (
              <input key={key} required={key === 'bank_name' || key === 'account_holder'} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={placeholder} dir={['card_number', 'account_number', 'iban'].includes(key) ? 'ltr' : 'rtl'} className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-gold" />
            ))}
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="توضیحات برای کاربر" className="min-h-20 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-gold" />
            <button disabled={saving} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gold font-bold text-black disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} ثبت حساب
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-3">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="rounded-2xl border border-white/8 bg-surface p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="flex items-start gap-3">
                  <ReceiptText className="mt-1 h-5 w-5 text-gold" />
                  <div>
                    <div className="font-bold text-white">{receipt.user?.first_name} {receipt.user?.last_name}</div>
                    <div className="mt-1 text-sm text-gold">{Number(receipt.amount).toLocaleString('fa-IR')} تومان</div>
                    <div className="mt-2 text-xs text-muted">کد پیگیری: {receipt.tracking_code || 'فایل رسید'} · زمان: {new Date(receipt.transferred_at).toLocaleString('fa-IR')}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {receipt.receipt_url && <button onClick={() => openReceipt(receipt.receipt_url!)} className="flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs text-muted"><Eye className="h-4 w-4" /> مشاهده رسید</button>}
                  {receipt.status === 'pending' ? (
                    <>
                      <button onClick={() => review(receipt, 'approved')} className="flex items-center gap-1 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs text-emerald-400"><BadgeCheck className="h-4 w-4" /> تأیید و شارژ کیف پول</button>
                      <button onClick={() => review(receipt, 'rejected')} className="flex items-center gap-1 rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-400"><XCircle className="h-4 w-4" /> رد</button>
                    </>
                  ) : (
                    <span className={`rounded-full px-3 py-1 text-xs ${receipt.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{receipt.status === 'approved' ? 'تأیید شده' : 'رد شده'}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {receipts.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-muted">رسیدی ثبت نشده است.</div>}
        </div>
      )}
    </div>
  )
}
