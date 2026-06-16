'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { toggleProductActive } from '@/lib/api/products'

interface Props {
  id: string
  isActive: boolean
}

export function ProductActiveToggle({ id, isActive }: Props) {
  const router = useRouter()
  const [checked, setChecked] = useState(isActive)
  const [saving, setSaving] = useState(false)

  async function handleChange(value: boolean) {
    setChecked(value)
    setSaving(true)
    try {
      await toggleProductActive(id, value)
      toast.success(value ? 'محصول فعال شد' : 'محصول به حالت پیش‌نویس درآمد')
      router.refresh()
    } catch (err) {
      setChecked(!value)
      toast.error('خطا در تغییر وضعیت: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setSaving(false)
    }
  }

  return <Switch checked={checked} onCheckedChange={handleChange} disabled={saving} />
}
