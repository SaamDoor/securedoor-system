'use client'

import { useCallback, useEffect, useState } from 'react'
import { Banknote, CheckCircle2, Clock3, Copy, Loader2, Upload, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import {
  getMyBankTransferReceipts,
  getVisibleBankAccounts,
  submitBankTransfer,
  type BankAccount,
  type BankTransferReceipt,
} from '@/lib/api/banking'
import { getWalletBalance, getWalletTransactions } from '@/lib/api/wallet'
import type { Wallet as WalletType, WalletTransaction } from '@/types'

export default function UserWalletPage() {
  const [wallet, setWallet] = useState<WalletType | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [receipts, setReceipts] = useState<BankTransferReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    bankAccountId: '',
    amount: '',
    transferredAt: '',
    trackingCode: '',
    userNote: '',
  })
  const [receiptFile, setReceiptFile] = useState<File>()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [walletRow, txRows, accountRows, receiptRows] = await Promise.all([
        getWalletBalance(),
        getWalletTransactions(1, 10),
        getVisibleBankAccounts(),
        getMyBankTransferReceipts(),
      ])
      setWallet(walletRow)
      setTransactions(txRows.transactions)
      setAccounts(accountRows)
      setReceipts(receiptRows)
      setForm((current) => ({ ...current, bankAccountId: current.bankAccountId || accountRows[0]?.id || '' }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'دریافت اطلاعات کیف پول ناموفق بود')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!form.trackingCode.trim() && !receiptFile) {
      toast.error('کد پیگیری یا تصویر رسید را وارد کنید')
      return
    }
    setSaving(true)
    try {
      await submitBankTransfer({
        bankAccountId: form.bankAccountId,
        amount: Number(form.amount),
        transferredAt: form.transferredAt,
        trackingCode: form.trackingCode,
        userNote: form.userNote,
        receiptFile,
      })
      toast.success('رسید ثبت شد و پس از بررسی به کیف پول اضافه می‌شود')
      setForm((current) => ({ ...current, amount: '', transferredAt: '', trackingCode: '', userNote: '' }))
      setReceiptFile(undefined)
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ثبت رسید ناموفق بود')
    } finally {
      setSaving(false)
    }
  }

  function copy(value: string) {
    void navigator.clipboard.writeText(value)
    toast.success('کپی شد')
  }

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="h-7 w-7 animate-spin text-gold" /></div>

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-black text-white">کیف پول و واریز بانکی</h1>
        <p className="mt-1 text-sm text-muted">موجودی، تراکنش‌ها و رسیدهای واریز خود را مدیریت کنید.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['موجودی قابل استفاده', wallet?.balance ?? 0],
          ['موجودی در انتظار', wallet?.pending_balance ?? 0],
          ['مجموع دریافتی', wallet?.lifetime_earned ?? 0],
        ].map(([label, value], index) => (
          <div key={String(label)} className="rounded-2xl border border-white/8 bg-surface p-5">
            <Wallet className={`mb-3 h-5 w-5 ${index === 0 ? 'text-gold' : 'text-muted'}`} />
            <div className="text-xl font-black text-white">{Number(value).toLocaleString('fa-IR')} تومان</div>
            <div className="mt-1 text-xs text-muted">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-white/8 bg-surface p-5">
          <div>
            <h2 className="font-bold text-white">حساب‌های بانکی تأییدشده</h2>
            <p className="mt-1 text-xs text-muted">مبلغ را واریز و سپس اطلاعات رسید را ثبت کنید.</p>
          </div>
          {accounts.map((account) => (
            <label key={account.id} className={`block cursor-pointer rounded-xl border p-4 transition-colors ${form.bankAccountId === account.id ? 'border-gold/50 bg-gold/5' : 'border-white/8'}`}>
              <div className="flex items-start gap-3">
                <input type="radio" name="bank-account" checked={form.bankAccountId === account.id} onChange={() => setForm({ ...form, bankAccountId: account.id })} className="mt-1 accent-gold" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white">{account.bank_name} — {account.account_holder}</div>
                  {[account.card_number, account.iban, account.account_number].filter(Boolean).map((value) => (
                    <button key={value} type="button" onClick={(event) => { event.preventDefault(); copy(value!) }} className="mt-2 flex max-w-full items-center gap-2 text-xs text-muted hover:text-gold" dir="ltr">
                      <Copy className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{value}</span>
                    </button>
                  ))}
                </div>
              </div>
            </label>
          ))}
          {accounts.length === 0 && <div className="rounded-xl border border-dashed border-white/10 py-10 text-center text-sm text-muted">فعلاً حساب بانکی فعالی وجود ندارد.</div>}
        </section>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/8 bg-surface p-5">
          <h2 className="font-bold text-white">ثبت رسید واریز</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input required min="1" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="مبلغ واریز (تومان)" className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-gold" />
            <input required type="datetime-local" value={form.transferredAt} onChange={(event) => setForm({ ...form, transferredAt: event.target.value })} className="h-11 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-gold" />
          </div>
          <input value={form.trackingCode} onChange={(event) => setForm({ ...form, trackingCode: event.target.value })} placeholder="کد پیگیری تراکنش" className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-gold" />
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 p-5 text-sm text-muted hover:border-gold/40 hover:text-gold">
            <Upload className="h-4 w-4" />
            {receiptFile ? receiptFile.name : 'آپلود تصویر یا PDF رسید (حداکثر ۵ مگابایت)'}
            <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={(event) => setReceiptFile(event.target.files?.[0])} />
          </label>
          <textarea value={form.userNote} onChange={(event) => setForm({ ...form, userNote: event.target.value })} placeholder="توضیحات اختیاری" className="min-h-20 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-gold" />
          <button disabled={saving || accounts.length === 0} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gold font-bold text-black disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Banknote className="h-4 w-4" />}
            ثبت برای بررسی
          </button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <History title="رسیدهای واریز">
          {receipts.map((receipt) => (
            <div key={receipt.id} className="flex items-center justify-between gap-3 border-b border-white/5 py-3 last:border-0">
              <div>
                <div className="text-sm font-semibold text-white">{Number(receipt.amount).toLocaleString('fa-IR')} تومان</div>
                <div className="mt-1 text-xs text-muted">{new Date(receipt.created_at).toLocaleString('fa-IR')}</div>
              </div>
              <Status status={receipt.status} />
            </div>
          ))}
        </History>
        <History title="آخرین تراکنش‌های کیف پول">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between gap-3 border-b border-white/5 py-3 last:border-0">
              <div>
                <div className="text-sm text-white">{transaction.description || 'تراکنش کیف پول'}</div>
                <div className="mt-1 text-xs text-muted">{new Date(transaction.created_at).toLocaleString('fa-IR')}</div>
              </div>
              <div className={`text-sm font-bold ${transaction.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{Number(transaction.amount).toLocaleString('fa-IR')} تومان</div>
            </div>
          ))}
        </History>
      </div>
    </div>
  )
}

function History({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-white/8 bg-surface p-5"><h2 className="mb-3 font-bold text-white">{title}</h2>{children}</section>
}

function Status({ status }: { status: BankTransferReceipt['status'] }) {
  if (status === 'approved') return <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> تأیید شده</span>
  if (status === 'rejected') return <span className="text-xs text-red-400">رد شده</span>
  return <span className="flex items-center gap-1 text-xs text-amber-400"><Clock3 className="h-3.5 w-3.5" /> در انتظار</span>
}
