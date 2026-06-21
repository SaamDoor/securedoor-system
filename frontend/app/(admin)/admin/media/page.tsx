import { Upload, Image, FileText } from 'lucide-react'

const mockFiles = [
  { id: 1, name: 'hero-bg.jpg', size: '2.4 MB', type: 'تصویر' },
  { id: 2, name: 'door-catalog.pdf', size: '5.1 MB', type: 'سند' },
  { id: 3, name: 'product-door-1.jpg', size: '1.2 MB', type: 'تصویر' },
  { id: 4, name: 'product-door-2.jpg', size: '980 KB', type: 'تصویر' },
  { id: 5, name: 'frame-types.png', size: '1.8 MB', type: 'تصویر' },
  { id: 6, name: 'installation-guide.pdf', size: '3.2 MB', type: 'سند' },
  { id: 7, name: 'logo.svg', size: '24 KB', type: 'تصویر' },
  { id: 8, name: 'team-photo.jpg', size: '1.5 MB', type: 'تصویر' },
]

export default function MediaPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-zinc-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">کتابخانه رسانه</h1>
            <p className="text-zinc-400 mt-1">مدیریت تصاویر و فایل‌های آپلودشده</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-zinc-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors">
            <Upload size={16} />
            آپلود فایل
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {mockFiles.map(file => (
            <div
              key={file.id}
              className="bg-zinc-800 rounded-xl overflow-hidden hover:bg-zinc-700 transition-colors cursor-pointer group"
            >
              <div className="aspect-square bg-zinc-700 flex items-center justify-center">
                {file.type === 'تصویر' ? (
                  <Image size={40} className="text-zinc-500 group-hover:text-amber-400 transition-colors" />
                ) : (
                  <FileText size={40} className="text-zinc-500 group-hover:text-amber-400 transition-colors" />
                )}
              </div>
              <div className="p-3">
                <p className="text-zinc-200 text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-zinc-500 text-xs">{file.size}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    file.type === 'تصویر' ? 'bg-blue-900/50 text-blue-400' : 'bg-purple-900/50 text-purple-400'
                  }`}>
                    {file.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
