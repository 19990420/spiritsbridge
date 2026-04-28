'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '../../components/ProtectedRoute'

const CATEGORY_OPTIONS = [
  { value: 'distillery_tour', label: '蒸留所ツアー' },
  { value: 'interview', label: '蔵元インタビュー' },
  { value: 'process', label: '製造工程' },
  { value: 'tasting', label: 'テイスティング' },
  { value: 'other', label: 'その他' },
]

export default function UploadVideo() {
  const { user } = useAuth()
  const router = useRouter()
  const [distilleryId, setDistilleryId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('interview')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [embedPreview, setEmbedPreview] = useState('')

  useEffect(() => {
    if (!user) return
    supabase.from('distilleries').select('id').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setDistilleryId(data.id) })
  }, [user])

  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    ]
    for (const p of patterns) {
      const m = url.match(p)
      if (m) return m[1]
    }
    return null
  }

  const handleUrlChange = (url: string) => {
    setYoutubeUrl(url)
    const id = extractYoutubeId(url)
    setEmbedPreview(id ? `https://www.youtube.com/embed/${id}` : '')
    if (url && !id) setError('有効なYouTube URLを入力してください')
    else setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!title.trim()) { setError('タイトルは必須です'); return }
    if (!youtubeUrl.trim()) { setError('YouTube URLは必須です'); return }
    if (!extractYoutubeId(youtubeUrl)) { setError('有効なYouTube URLを入力してください'); return }

    setLoading(true)
    try {
      const { error } = await supabase.from('videos').insert([{
        distillery_id: distilleryId,
        title: title.trim(),
        youtube_url: youtubeUrl.trim(),
        description: description.trim(),
        category,
        status: 'published',
        updated_at: new Date().toISOString(),
      }])
      if (error) throw error
      setSuccess('動画を登録しました')
      setTimeout(() => router.push('/admin/dashboard'), 1200)
    } catch (e: any) {
      setError(e.message || '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-900 text-white p-4 flex justify-between items-center">
          <h1 className="text-yellow-400 text-xl font-bold">SPIRITSBRIDGE</h1>
          <span className="text-sm">動画登録</span>
        </nav>

        <main className="max-w-3xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">動画を登録する</h1>
            <a href="/admin/dashboard" className="text-blue-700 hover:underline text-sm">← ダッシュボードへ</a>
          </div>

          {!distilleryId && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded mb-4">
              先に<a href="/admin/distillery" className="underline font-semibold">蒸留所プロフィール</a>を作成してください。
            </div>
          )}
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">動画タイトル *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="例：蔵元インタビュー — 余市蒸留所の130年"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">YouTube URL *</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={e => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {embedPreview && (
                <div className="mt-3 aspect-video rounded overflow-hidden border">
                  <iframe src={embedPreview} className="w-full h-full" allowFullScreen title="preview" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">カテゴリー</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">説明</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="この動画の内容・見どころを記入してください"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-4 pt-2 border-t">
              <button type="submit" disabled={loading || !distilleryId}
                className="bg-blue-900 text-white px-6 py-2 rounded hover:bg-blue-800 disabled:opacity-50 font-medium">
                {loading ? '保存中...' : '登録する'}
              </button>
              <a href="/admin/dashboard" className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 font-medium">
                キャンセル
              </a>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  )
}
