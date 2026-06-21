import { CheckCircle, XCircle, MessageSquare } from 'lucide-react'

const mockComments = [
  { id: 1, user: 'احمد رضایی', text: 'مقاله بسیار مفیدی بود. ممنون از توضیحات کامل و جامع شما در مورد انواع درب‌های امنیتی...', post: 'راهنمای انتخاب درب ضد سرقت', date: '۱۴۰۳/۰۴/۰۲', status: 'در انتظار' },
  { id: 2, user: 'مریم احمدی', text: 'خیلی ممنون. سوالم این است که آیا قفل‌های دیجیتال نیاز به تعمیر و نگهداری دارند؟', post: 'نکات نگهداری از درب‌های امنیتی', date: '۱۴۰۳/۰۴/۰۱', status: 'تأییدشده' },
  { id: 3, user: 'علی کریمی', text: 'عالی بود، دقیقا همین اطلاعات را نیاز داشتم برای تصمیم‌گیری.', post: 'تفاوت درب‌های چوبی و فلزی', date: '۱۴۰۳/۰۳/۳۰', status: 'تأییدشده' },
  { id: 4, user: 'فاطمه موسوی', text: 'آیا امکان نصب درب دو لنگه هم وجود دارد؟ و هزینه آن چقدر است؟', post: 'راهنمای انتخاب درب ضد سرقت', date: '۱۴۰۳/۰۳/۲۸', status: 'رد‌شده' },
  { id: 5, user: 'حسن تهرانی', text: 'ممنون از محتوای ارزنده. لطفاً بیشتر در مورد قفل‌های هوشمند بنویسید.', post: 'نکات نگهداری از درب‌های امنیتی', date: '۱۴۰۳/۰۳/۲۵', status: 'تأییدشده' },
]

const statusStyle: Record<string, string> = {
  'تأییدشده': 'bg-green-900/50 text-green-400',
  'در انتظار': 'bg-yellow-900/50 text-yellow-400',
  'رد‌شده': 'bg-red-900/50 text-red-400',
}

export default function BlogCommentsPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">مدیریت نظرات</h1>
          <p className="text-zinc-400 mt-1">بررسی و تأیید نظرات کاربران روی مقالات</p>
        </div>

        <div className="bg-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">کاربر</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">متن نظر</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">مقاله</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">تاریخ</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">وضعیت</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {mockComments.map(comment => (
                <tr key={comment.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors">
                  <td className="px-6 py-4 text-zinc-100 font-medium whitespace-nowrap">{comment.user}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm max-w-xs">
                    <span className="line-clamp-2">{comment.text.substring(0, 60)}...</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm max-w-xs">
                    <span className="line-clamp-1">{comment.post}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm whitespace-nowrap">{comment.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[comment.status]}`}>
                      {comment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-green-400 hover:text-green-300 transition-colors"><CheckCircle size={16} /></button>
                      <button className="text-red-400 hover:text-red-300 transition-colors"><XCircle size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
