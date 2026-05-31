'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Plus, Pencil, Trash2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { addressSchema, type AddressFormData } from '@/lib/validations/auth'
import { PROVINCES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Address extends AddressFormData {
  id: string
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: '1',
    label: 'خانه',
    recipientName: 'مهمان کاربری',
    phone: '09120000000',
    province: 'تهران',
    city: 'تهران',
    street: 'خیابان ولیعصر، پلاک ۱۲۳',
    postalCode: '1234567890',
    isDefault: true,
  },
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { isDefault: false },
  })

  function openAdd() {
    reset()
    setEditingId(null)
    setIsDialogOpen(true)
  }

  function openEdit(address: Address) {
    setEditingId(address.id)
    setValue('label', address.label)
    setValue('recipientName', address.recipientName)
    setValue('phone', address.phone)
    setValue('province', address.province)
    setValue('city', address.city)
    setValue('street', address.street)
    setValue('postalCode', address.postalCode)
    setValue('isDefault', address.isDefault)
    setIsDialogOpen(true)
  }

  async function onSubmit(data: AddressFormData) {
    await new Promise((r) => setTimeout(r, 800))

    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) => a.id === editingId ? { ...data, id: editingId } : a),
      )
    } else {
      const newId = Date.now().toString()
      setAddresses((prev) => {
        const updated = data.isDefault
          ? prev.map((a) => ({ ...a, isDefault: false }))
          : prev
        return [...updated, { ...data, id: newId }]
      })
    }

    setIsDialogOpen(false)
    reset()
  }

  function deleteAddress(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">آدرس‌های من</h1>
        <Button
          variant="gold"
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={openAdd}
        >
          آدرس جدید
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {addresses.map((address, i) => (
            <motion.div
              key={address.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'relative rounded-2xl p-5 border transition-all duration-200',
                address.isDefault
                  ? 'bg-[#C8A85D]/5 border-[#C8A85D]/30'
                  : 'bg-[#181818] border-white/8 hover:border-white/15',
              )}
            >
              {address.isDefault && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1 text-xs text-[#C8A85D] font-medium">
                    <CheckCircle className="h-3.5 w-3.5" />
                    پیش‌فرض
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#C8A85D]/10 border border-[#C8A85D]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-[#C8A85D]" />
                </div>
                <div>
                  <div className="font-bold text-white">{address.label}</div>
                  <div className="text-sm text-[#A0A0A0]">{address.recipientName}</div>
                </div>
              </div>

              <div className="text-sm text-[#A0A0A0] space-y-1 mb-5">
                <div>{address.province}، {address.city}</div>
                <div>{address.street}</div>
                <div>کد پستی: {address.postalCode}</div>
                <div>{address.phone}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(address)}
                  className="flex items-center gap-1.5 text-xs text-[#A0A0A0] hover:text-white px-3 py-1.5 rounded-lg border border-white/8 hover:border-white/20 transition-all"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  ویرایش
                </button>
                <button
                  onClick={() => deleteAddress(address.id)}
                  className="flex items-center gap-1.5 text-xs text-[#A0A0A0] hover:text-[#E74C3C] px-3 py-1.5 rounded-lg border border-white/8 hover:border-[#C0392B]/30 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'ویرایش آدرس' : 'آدرس جدید'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="عنوان آدرس"
                placeholder="خانه / محل کار"
                error={errors.label?.message}
                {...register('label')}
              />
              <Input
                label="نام تحویل‌گیرنده"
                error={errors.recipientName?.message}
                {...register('recipientName')}
              />
            </div>

            <Input
              label="شماره تماس"
              type="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#A0A0A0]">استان</label>
                <select
                  className="h-11 rounded-xl px-4 bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#C8A85D]"
                  {...register('province')}
                >
                  <option value="">انتخاب استان</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p} className="bg-[#181818]">{p}</option>
                  ))}
                </select>
                {errors.province && (
                  <p className="text-xs text-[#E74C3C]">{errors.province.message}</p>
                )}
              </div>
              <Input
                label="شهر"
                error={errors.city?.message}
                {...register('city')}
              />
            </div>

            <Input
              label="آدرس دقیق"
              error={errors.street?.message}
              {...register('street')}
            />

            <Input
              label="کد پستی"
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-[#C8A85D]" {...register('isDefault')} />
              <span className="text-sm text-[#A0A0A0]">تنظیم به عنوان آدرس پیش‌فرض</span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="gold" size="md" loading={isSubmitting}>
                {editingId ? 'ذخیره تغییرات' : 'افزودن آدرس'}
              </Button>
              <Button
                type="button"
                variant="dark"
                size="md"
                onClick={() => setIsDialogOpen(false)}
              >
                انصراف
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
