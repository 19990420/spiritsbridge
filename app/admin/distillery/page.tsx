'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '../../components/ProtectedRoute'

export default function DistilleryProfile() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    prefecture: '',
    city: '',
    representative: '',
    story: '',
    process: '',
    message: '',
    status: 'draft' as 'draft' | 'published',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [coverFiles, setCoverFiles] = useState<File[]>([])
  const [coverPreviews, setCoverPreviews] = useState<string[]>([])
  const [coverUrls, setCoverUrls] = useState<string[]>([])

  useEffect(() => {
    if (!user) return
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('distilleries').select('*').eq('user_id', user!.id).single()
      if (data) {
        setProfileId(data.id)
        setFormData({
          name: data.name || '',
          prefecture: data.prefecture || '',
          city: data.city || '',
          representative: data.representative || '',
          story: data.story || '',
          process: data.process || '',
          message: data.message || '',
          status: data.status || 'draft',
        })
        if (data.logo_url) { setLogoPreview(data.logo_url); setLogoUrl(data.logo_url) }
        if (data.cover_images?.length) { setCoverPreviews(data.cover_images); setCoverUrls(data.cover_images) }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { setError('ロゴ画像は5MB以下にしてください'); return }
    setLogoFile(file)
    const reader = new FileReader()
    reader.onload = e => setLogoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleCoverSelect = (files: FileList) => {
    const newFiles = Array.from(files).filter(f => f.size <= 10 * 1024 * 1024)
    setCoverFiles(prev => [...prev, ...newFiles])
    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = e => setCoverPreviews(prev => [...prev, e.target?.result as string])
      reader.readAsDataURL(file)
    })
  }

  const removeCover = (index: number) => {
    setCoverPreviews(prev => prev.filter((_, i) => i !== index))
    setCoverUrls(prev => prev.filter((_, i) => i !== index))
    setCoverFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('images').upload(path, file)
    if (error) throw error
    return supabase.storage.from('images').getPublicUrl(path).data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) { setError('蒸留所名は必須です'); return }
    setError('')
    setLoading(true)
    try {
      let finalLogoUrl = logoUrl
      if (logoFile) finalLogoUrl = await uploadImage(logoFile, 'distillery/logos')

      const newCoverUrls: string[] = []
      for (const file of coverFiles) {
        const url = await uploadImage(file, 'distillery/covers')
        newCoverUrls.push(url)
      }
      const allCoverUrls = [...coverUrls.filter(u => !u.startsWith('data:')), ...newCoverUrls]

      const payload = {
        user_id: user!.id,
        name: formData.name.trim(),
        prefecture: formData.prefecture.trim(),
        city: formData.city.trim(),
        representative: formData.representative.trim(),
        story: formData.story.trim(),
        process: formData.process.trim(),
        message: formData.message.trim(),
        logo_url: finalLogoUrl || null,
        cover_images: allCoverUrls,
        status: formData.status,
        updated_at: new Date().toISOString(),
      }

      if (profileId) {
        const { error } = await supabase.from('distilleries').update(payload).eq('id', profileId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('distilleries').insert([payload]).select('id').single()
        if (error) throw error
        setProfileId(data.id)
      }

      setCoverFiles([])
      setCoverUrls(allCoverUrls)
      setCoverPreviews(allCoverUrls)
      setLogoFile(null)
      setLogoUrl(finalLogoUrl)
      setSuccess('プロフィールを保存しました')
    } catch (e: any) {
      setError(e.message || '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <ProtectedRoute><div className="min-h-screen flex items-center justify-center">読み込み中...</div></ProtectedRoute>
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-900 text-white p-4 flex justify-between items-center">
          <h1 className="text-yellow-400 text-xl font-bold">SPIRITSBRIDGE</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">蒸留所プロフィール</span>
            <button onClick={() => supabase.auth.signOut()}
              className="bg-yellow-400 text-black px-3 py-1 rounded text-sm hover:bg-yellow-300">ログアウト</button>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">蒸留所プロフィール編集</h1>
              <p className="text-sm text-gray-500 mt-1">ここで入力した情報が商品ページ・記事に掲載されます</p>
            </div>
            <a href="/admin/dashboard" className="text-blue-700 hover:underline text-sm">← ダッシュボード</a>
          </div>

          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── 基本情報 ── */}
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-4 pb-2 border-b">基本情報</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">蒸留所・酒蔵名 *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    placeholder="例：余市蒸留所" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">都道府県</label>
                  <input type="text" name="prefecture" value={formData.prefecture} onChange={handleChange}
                    placeholder="例：北海道" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">市区町村</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange}
                    placeholder="例：余市町" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">代表者名 / 杜氏名</label>
                  <input type="text" name="representative" value={formData.representative} onChange={handleChange}
                    placeholder="例：山崎 太郎" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </section>

            {/* ── ロゴ ── */}
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-4 pb-2 border-b">ロゴ画像</h2>
              <div className="flex items-start gap-6">
                {logoPreview && (
                  <img src={logoPreview} alt="logo" className="w-24 h-24 object-contain border rounded p-1" />
                )}
                <div className="flex-1">
                  <button type="button" onClick={() => logoInputRef.current?.click()}
                    className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50">
                    {logoPreview ? 'ロゴを変更' : 'ロゴをアップロード'}
                  </button>
                  <input ref={logoInputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.svg" className="hidden"
                    onChange={e => e.target.files?.[0] && handleLogoSelect(e.target.files[0])} />
                  <p className="text-xs text-gray-400 mt-1">推奨: 正方形、PNG/SVG、5MB以下</p>
                </div>
              </div>
            </section>

            {/* ── カバー画像 ── */}
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-4 pb-2 border-b">カバー・施設写真</h2>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition"
                onClick={() => coverInputRef.current?.click()}
                onDrop={e => { e.preventDefault(); e.dataTransfer.files && handleCoverSelect(e.dataTransfer.files) }}
                onDragOver={e => e.preventDefault()}
              >
                <p className="text-gray-500 text-sm">クリックまたはドラッグ＆ドロップ（複数選択可, 10MB/枚）</p>
              </div>
              <input ref={coverInputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => e.target.files && handleCoverSelect(e.target.files)} />
              {coverPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {coverPreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} alt={`cover ${i}`} className="w-full h-28 object-cover rounded" />
                      <button type="button" onClick={() => removeCover(i)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">×</button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── ストーリー ── */}
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-4 pb-2 border-b">作り手のストーリー</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">蒸留所・酒蔵のストーリー</label>
                  <p className="text-xs text-gray-400 mb-2">創業の経緯、地域との関係、受け継いできた思いを自由に記述してください</p>
                  <textarea name="story" value={formData.story} onChange={handleChange} rows={6}
                    placeholder="例：1934年、北海道余市に創業。荒涼たる大地と豊かな水が育む..."
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">製造工程・こだわり</label>
                  <p className="text-xs text-gray-400 mb-2">原料の選定・仕込み・熟成・瓶詰めなど、独自の工程やこだわりを記述してください</p>
                  <textarea name="process" value={formData.process} onChange={handleChange} rows={5}
                    placeholder="例：地元農家と契約栽培した二条大麦を使用。石炭直火蒸留による..."
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">海外バイヤーへのメッセージ</label>
                  <p className="text-xs text-gray-400 mb-2">あなたのお酒を世界に届けたい思いを英語・日本語どちらでも</p>
                  <textarea name="message" value={formData.message} onChange={handleChange} rows={4}
                    placeholder="例：Our spirits carry the spirit of Hokkaido's untamed nature..."
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </section>

            {/* ── 公開設定 ── */}
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-4 pb-2 border-b">公開設定</h2>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value="draft" checked={formData.status === 'draft'}
                    onChange={handleChange} />
                  <span className="text-sm">下書き（非公開）</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value="published" checked={formData.status === 'published'}
                    onChange={handleChange} />
                  <span className="text-sm">公開する</span>
                </label>
              </div>
            </section>

            <div className="flex gap-4">
              <button type="submit" disabled={loading}
                className="bg-blue-900 text-white px-8 py-3 rounded hover:bg-blue-800 disabled:opacity-50 font-semibold">
                {loading ? '保存中...' : 'プロフィールを保存'}
              </button>
              <a href="/admin/dashboard"
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded hover:bg-gray-300 font-medium">
                キャンセル
              </a>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  )
}
